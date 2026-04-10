import { PostDetail } from "./PostDetail"
export interface PostDetailState {
  post: PostDetail | null
  loading: boolean
  error: string | null
}