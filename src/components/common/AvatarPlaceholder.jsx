import PlaceholderImage from './PlaceholderImage'

function AvatarPlaceholder({ className = '', label = 'Photo', imageUrl = '' }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={label}
        className={`rounded-full object-cover ${className}`}
      />
    )
  }

  return <PlaceholderImage label={label} variant="circle" className={className} />
}

export default AvatarPlaceholder
