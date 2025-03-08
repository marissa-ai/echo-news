import { ArticleCard } from './ArticleCard'

interface Article {
  article_id: number
  title: string
  description: string
  category: string
  submitted_by: string
  created_at: string
  upvotes: number
  downvotes: number
  tags: string[]
}

interface ArticleListProps {
  articles: Article[]
  isLoading?: boolean
}

export function ArticleList({ articles, isLoading = false }: ArticleListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[300px] rounded-lg bg-secondary-100 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!articles?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-2xl font-semibold text-secondary-900">
          No articles found
        </h2>
        <p className="mt-2 text-secondary-500">
          Try adjusting your search or filter criteria
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.article_id} article={article} />
      ))}
    </div>
  )
} 