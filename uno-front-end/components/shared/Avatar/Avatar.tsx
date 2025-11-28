'use client'

interface AvatarProps {
  seed: string
}

const Avatar = ({ seed }: AvatarProps) => {
  return (
    <div className="relative w-full min-w-[100px] max-w-[120px] rounded-full border border-[#000318] shadow-[0_0_6px_3px_rgba(23,25,41,1)] pb-[100%]">
      <img
        className="absolute inset-0 h-full w-full rounded-full object-cover object-top"
        src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`}
        alt=""
      />
    </div>
  )
}

export default Avatar

