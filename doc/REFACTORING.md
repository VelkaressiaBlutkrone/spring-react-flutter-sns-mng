# 프로젝트 리팩토링 제안

이 문서는 `spring_thymleaf_map_sns_mng` 프로젝트의 코드 품질, 유지보수성, 성능 향상을 위한 리팩토링 제안 사항을 정리합니다.
현재 백엔드(Spring)와 웹 프론트엔드(React)를 중심으로 분석했으며, 모바일(Flutter) 부분은 추후 동일한 방식으로 심층 분석이 필요합니다.

## 1. Backend (Spring Boot)

전반적으로 계층 분리가 잘 되어 있고 REST 원칙을 준수하려는 노력이 보입니다. 몇 가지 중복 코드를 제거하고 Spring 기능을 활용하여 코드를 더 깔끔하게 개선할 수 있습니다.

### 1.1. Controller의 인증 사용자 정보 조회 로직 개선

**현상:**
`PostController` 등 다수의 컨트롤러 메소드에서 `authService.getCurrentUserEntity()`를 반복적으로 호출하여 인증된 사용자 정보를 조회하고 있습니다.

```java
// PostController.java
@PostMapping
public ResponseEntity<PostResponse> create(@Valid @RequestBody PostCreateRequest request) {
    User author = authService.getCurrentUserEntity() // <-- 반복되는 부분
            .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
    // ...
}

@PutMapping("/{id}")
public ResponseEntity<PostResponse> update(@PathVariable Long id, @Valid @RequestBody PostUpdateRequest request) {
    User currentUser = authService.getCurrentUserEntity() // <-- 반복되는 부분
            .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
    // ...
}
```

**문제점:**

- 여러 메소드에 걸쳐 동일한 코드가 반복됩니다.
- 컨트롤러가 `AuthService`에 직접 의존하게 되어 테스트 작성이 조금 더 번거로워집니다.

**개선 방안:**
Spring Security가 제공하는 `@AuthenticationPrincipal` 어노테이션을 사용하여 인증된 사용자 객체를 메소드 파라미터로 직접 주입받습니다.

```java
// 개선 후 PostController.java
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.sns.security.UserPrincipal; // UserDetails 구현체

// ...

@PostMapping
public ResponseEntity<PostResponse> create(
    @Valid @RequestBody PostCreateRequest request,
    @AuthenticationPrincipal UserPrincipal principal
) {
    // UserPrincipal에서 User 엔티티를 가져오는 메소드가 필요.
    // User author = userService.findById(principal.getUserId());
    PostResponse response = postService.create(request, author);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
}

@PutMapping("/{id}")
public ResponseEntity<PostResponse> update(
    @PathVariable Long id,
    @Valid @RequestBody PostUpdateRequest request,
    @AuthenticationPrincipal UserPrincipal principal
) {
    // User currentUser = userService.findById(principal.getUserId());
    return ResponseEntity.ok(postService.update(id, request, currentUser));
}
```

**기대 효과:**

- 컨트롤러에서 인증 관련 상용 코드가 제거되어 비즈니스 로직에 더 집중할 수 있습니다.
- 코드가 더 선언적으로 바뀌고 가독성이 향상됩니다.

### 1.2. Service 계층의 중복 로직 추출

**현상:**
`PostService` 내에 일반 사용자의 수정(`update`) 로직과 관리자의 수정(`updateByAdmin`) 로직이 거의 동일하게 중복되어 있습니다.

```java
// PostService.java
@Transactional
public PostResponse update(Long id, PostUpdateRequest request, User currentUser) {
    Post post = // ... 게시글 조회 및 소유권 검증
    // ▼ 중복 로직 시작
    Double lat = request.latitude() != null ? request.latitude() : post.getLatitude();
    Double lng = request.longitude() != null ? request.longitude() : post.getLongitude();
    var pin = request.pinId() != null
            ? pinRepository.findById(request.pinId()).orElse(null)
            : (lat == null && lng == null ? null : post.getPin());
    post.update(request.title(), request.content(), lat, lng, pin);
    // ▲ 중복 로직 끝
    return PostResponse.from(post);
}

@Transactional
public PostResponse updateByAdmin(Long id, PostUpdateRequest request) {
    Post post = // ... 게시글 조회
    // ▼ 중복 로직 시작
    Double lat = request.latitude() != null ? request.latitude() : post.getLatitude();
    Double lng = request.longitude() != null ? request.longitude() : post.getLongitude();
    var pin = request.pinId() != null
            ? pinRepository.findById(request.pinId()).orElse(null)
            : (lat == null && lng == null ? null : post.getPin());
    post.update(request.title(), request.content(), lat, lng, pin);
    // ▲ 중복 로직 끝
    log.info("관리자 게시글 수정: postId={}", id);
    return PostResponse.from(post);
}
```

**문제점:**

- 동일한 로직이 두 곳에 존재하여 향후 수정 시 양쪽을 모두 변경해야 하는 실수를 유발할 수 있습니다.

**개선 방안:**
중복되는 로직을 별도의 `private` 헬퍼 메소드로 추출하여 재사용합니다.

```java
// 개선 후 PostService.java

@Transactional
public PostResponse update(Long id, PostUpdateRequest request, User currentUser) {
    Post post = // ... 게시글 조회 및 소유권 검증
    updatePostInternal(post, request);
    return PostResponse.from(post);
}

@Transactional
public PostResponse updateByAdmin(Long id, PostUpdateRequest request) {
    Post post = // ... 게시글 조회
    updatePostInternal(post, request);
    log.info("관리자 게시글 수정: postId={}", id);
    return PostResponse.from(post);
}

private void updatePostInternal(Post post, PostUpdateRequest request) {
    Double lat = request.latitude() != null ? request.latitude() : post.getLatitude();
    Double lng = request.longitude() != null ? request.longitude() : post.getLongitude();
    var pin = request.pinId() != null
            ? pinRepository.findById(request.pinId()).orElse(null)
            : (lat == null && lng == null ? null : post.getPin());
    post.update(request.title(), request.content(), lat, lng, pin);
}
```

**기대 효과:**

- 코드 중복이 제거되고 재사용성이 향상됩니다.
- 로직이 한 곳에서 관리되어 유지보수성이 높아집니다.

---

## 2. Web Frontend (React)

`react-query`를 사용한 서버 상태 관리, API 모듈 분리 등 좋은 패턴을 사용하고 있습니다. 여기서는 컴포넌트의 재사용성과 가독성을 높이는 방향의 리팩토링을 제안합니다.

### 2.1. 페이지네이션(Pagination) 로직 추상화

**현상:**
`PostListPage.tsx`에서 페이징(이전/다음)을 위한 상태와 UI 로직이 컴포넌트 내에 직접 구현되어 있습니다.

```tsx
// PostListPage.tsx
const [page, setPage] = useState(0);
// ...
const totalPages = data?.data.totalPages ?? 0;
// ...
<button
  onClick={() => setPage((p) => Math.max(0, p - 1))}
  disabled={page === 0}
>
  이전
</button>
<span>{page + 1} / {totalPages}</span>
<button
  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
  disabled={page >= totalPages - 1}
>
  다음
</button>
```

**문제점:**

- 다른 목록 페이지(이미지 게시글 목록 등)에서도 동일한 페이징 로직이 필요할 경우, 코드가 중복될 가능성이 높습니다.

**개선 방안:**
페이징 관련 상태와 핸들러를 관리하는 `usePagination` 커스텀 훅을 만들거나, UI까지 포함하는 `Pagination` 컴포넌트를 만들어 재사용합니다.

```tsx
// 예시: Pagination 컴포넌트
// components/Pagination.tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // ... JSX UI 구현
}

// 개선 후 PostListPage.tsx
// ...
{
  totalPages > 1 && (
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      onPageChange={setPage}
    />
  );
}
// ...
```

**기대 효과:**

- 페이징 로직과 UI가 중앙에서 관리되어 일관성이 유지되고 재사용성이 높아집니다.
- 페이지 컴포넌트는 페이징 구현의 상세를 알 필요가 없어 더 깔끔해집니다.

### 2.2. 목록 아이템 컴포넌트 분리

**현상:**
`PostListPage.tsx`에서 게시글 목록을 렌더링하는 `map` 함수 내부의 JSX가 복잡합니다.

```tsx
// PostListPage.tsx
content.map((post) => (
  <li key={post.id} className="rounded-xl ...">
    <div className="flex items-start ...">
      <Link to={`/posts/${post.id}`} className="flex-1 ...">
        {/* ... 매우 긴 JSX 코드 ... */}
      </Link>
      {/* ... 수정 버튼 등 ... */}
    </div>
  </li>
));
```

**문제점:**

- 페이지 컴포넌트가 너무 많은 렌더링 책임을 갖게 되어 가독성이 떨어집니다.
- 개별 게시글 아이템의 레이아웃을 다른 곳에서 재사용하기 어렵습니다.

**개선 방안:**
`li`에 해당하는 부분을 별도의 `PostListItem` 컴포넌트로 분리합니다.

```tsx
// components/PostListItem.tsx
import { Post } from "@/types"; // Post 타입 정의 필요

interface PostListItemProps {
  post: Post;
  currentUserId?: number;
}

export function PostListItem({ post, currentUserId }: PostListItemProps) {
  return <li className="rounded-xl ...">{/* ... 분리된 JSX ... */}</li>;
}

// 개선 후 PostListPage.tsx
import { PostListItem } from "@/components/PostListItem";
// ...
content.map((post) => (
  <PostListItem key={post.id} post={post} currentUserId={user?.id} />
));
```

**기대 효과:**

- `PostListPage`는 목록을 렌더링하는 책임만 지고, `PostListItem`은 개별 아이템을 렌더링하는 책임을 져서 관심사가 명확히 분리됩니다.
- 가독성과 유지보수성이 향상됩니다.

---

## 3. 향후 분석 제안

### 3.1. 모바일 (Flutter)

모바일 프로젝트는 클린 아키텍처를 적용하여 구조가 잘 잡혀있는 것으로 보입니다. 하지만 실제 코드 레벨에서 다음과 같은 추가 분석을 진행할 수 있습니다.

- **State Management 일관성**: 선택된 상태 관리 솔루션(Provider, Riverpod 등)이 프로젝트 전반에 걸쳐 일관되고 올바르게 사용되고 있는지 확인합니다.
- **위젯 복잡도**: `build` 메소드가 지나치게 길고 복잡한 위젯이 있다면, 이를 더 작은 단위의 위젯으로 분리하는 리팩토링을 고려합니다.
- **비동기 처리**: `FutureBuilder`, `StreamBuilder` 사용 시 로딩/에러 상태 처리가 올바르게 구현되었는지 검토합니다.

### 3.2. 공통

- **API 타입 정의**: 백엔드의 DTO와 프론트엔드의 TypeScript 타입을 동기화하는 방안을 고려할 수 있습니다. (예: `openapi-typescript-codegen` 같은 도구 사용)
- **환경 변수 관리**: 각 프로젝트(`backend`, `web`, `mobile`)의 환경 변수 관리 방식과 문서화를 통일하여 개발 환경 설정을 용이하게 합니다.
