export default function Avatar({
    name,
    avatar,
    size = "md",
    className = "",
}) {
    const sizes = {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-sm",
        md: "h-10 w-10 text-base",
        lg: "h-14 w-14 text-xl",
        xl: "h-20 w-20 text-3xl",
    };

    if (avatar) {
        return (
            <img
                src={avatar}
                alt={name}
                className={`rounded-full object-cover ${sizes[size]} ${className}`}
            />
        );
    }

    return (
        <div
            className={`
        flex items-center justify-center
        rounded-full
        border border-marquee-gold/30
        bg-marquee-panel
        font-bold
        text-marquee-gold
        ${sizes[size]}
        ${className}
      `}
        >
            {name?.charAt(0).toUpperCase()}
        </div>
    );
}