import PlaceholderImage from './PlaceholderImage'

function AvatarPlaceholder({ className = '', label = 'Photo' }) {
  return <PlaceholderImage label={label} variant="circle" className={className} />
}

export default AvatarPlaceholder
