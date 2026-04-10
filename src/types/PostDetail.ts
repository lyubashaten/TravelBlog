import { UserInfo } from "../types/UserInfo"

export interface PostDetail {
  id: number
  title: string
  description: string
  country: string
  city: string
  photo: string
  comments: Comment[]
  userInfo: UserInfo
}