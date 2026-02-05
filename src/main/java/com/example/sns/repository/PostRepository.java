package com.example.sns.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.sns.domain.Post;

/**
 * 게시글 Repository.
 *
 * Step 8: 목록(페이징·검색)·상세.
 */
public interface PostRepository extends JpaRepository<Post, Long> {

    /**
     * 제목 또는 내용에 키워드 포함 검색. 키워드 없으면 전체 조회.
     */
    Page<Post> findByTitleContainingOrContentContaining(String titleKeyword, String contentKeyword, Pageable pageable);

    default Page<Post> findAllByKeyword(String keyword, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) {
            return findAll(pageable);
        }
        String trimmed = keyword.trim();
        return findByTitleContainingOrContentContaining(trimmed, trimmed, pageable);
    }
}
