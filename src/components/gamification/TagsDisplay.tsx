'use client';

interface TagDisplayProps {
  tags: Array<{
    id: string;
    name: string;
    description?: string;
    isLimited: boolean;
    seasonName?: string;
    seasonTheme?: string;
    grantedAt?: Date | string;
  }>;
  maxDisplay?: number;
}

export function TagsDisplay({ tags, maxDisplay = 10 }: TagDisplayProps) {
  const displayTags = tags.slice(0, maxDisplay);
  const remainingCount = tags.length - maxDisplay;

  if (tags.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <p>No tags earned yet</p>
        <p className="text-xs mt-1">Complete challenges to earn exclusive tags!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayTags.map((tag) => (
        <div
          key={tag.id}
          className={`p-3 rounded-lg border transition-all hover:scale-[1.02] ${
            tag.isLimited
              ? 'bg-gradient-to-r from-amber-500/10 to-pink-500/10 border-amber-500/30'
              : 'bg-card border-border'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{tag.name}</h4>
                {tag.isLimited && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Limited
                  </span>
                )}
              </div>
              {tag.description && (
                <p className="text-sm text-muted-foreground mt-1">{tag.description}</p>
              )}
              {tag.seasonName && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Season:</span>
                  <span className="font-medium text-brand">{tag.seasonName}</span>
                  {tag.seasonTheme && (
                    <span className="text-muted-foreground">• {tag.seasonTheme}</span>
                  )}
                </div>
              )}
            </div>
            {tag.isLimited && (
              <div className="text-2xl opacity-50">🏆</div>
            )}
          </div>
        </div>
      ))}

      {remainingCount > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          +{remainingCount} more tag{remainingCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
