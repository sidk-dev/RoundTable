import Avatar from "../Avatar";

export default function PostCard({
  id,
  title,
  description,
  community,
  date,
  author,
}) {
  const { firstName, lastName, profileImage } = author;
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <article
      key={id}
      className="
        bg-surface
        border border-border
        rounded-2xl
        p-6
        flex flex-col
        transition
        hover:shadow-md
        hover:border-primary-400
      "
    >
      {/* Content */}
      <div className="mb-6">
        {community && (
          <span
            className="
              inline-block
              text-xs
              font-medium
              px-3 py-1
              rounded-full
              bg-primary-100 text-primary-700
              dark:bg-primary-300 dark:text-primary-900
              mb-4
            "
          >
            {community}
          </span>
        )}

        <h2 className="text-lg font-semibold leading-snug mb-3">{title}</h2>

        <p className="text-sm text-t-secondary leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          <Avatar
            firstName={firstName}
            lastName={lastName}
            profileImage={profileImage}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium">{fullName}</p>
            {date && <p className="text-xs text-t-muted">{date}</p>}
          </div>
        </div>
      </div>
    </article>
  );
}
