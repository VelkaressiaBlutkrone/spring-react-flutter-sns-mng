/**
 * 게시글/이미지 게시글 위치 마커.
 * 클릭 시 해당 게시글로 이동.
 */
import { MapMarker } from 'react-kakao-maps-sdk';
import { Link } from 'react-router-dom';

export type PostMarkerType = 'post' | 'imagePost';

export interface PostMarkerData {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
  type: PostMarkerType;
}

export interface PostMarkerProps {
  post: PostMarkerData;
}

export function PostMarker({ post }: PostMarkerProps) {
  const position = { lat: post.latitude, lng: post.longitude };
  const linkTo = post.type === 'imagePost' ? `/image-posts/${post.id}` : `/posts/${post.id}`;

  return (
    <MapMarker position={position}>
      <div className="min-w-[180px] rounded-lg border border-slate-200 bg-white p-2 shadow">
        <div className="text-xs font-medium text-slate-500">
          {post.type === 'imagePost' ? '이미지' : '게시글'}
        </div>
        <div className="truncate text-sm font-medium text-slate-900">{post.title}</div>
        <Link
          to={linkTo}
          className="mt-2 block rounded bg-blue-600 px-2 py-1 text-center text-xs font-medium text-white hover:bg-blue-500"
        >
          보기
        </Link>
      </div>
    </MapMarker>
  );
}
