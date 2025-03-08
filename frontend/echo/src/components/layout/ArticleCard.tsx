import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ArticleCardProps {
  article: {
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
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="line-clamp-2">
            <Link href={`/article/${article.article_id}`} className="hover:underline">
              {article.title}
            </Link>
          </CardTitle>
          <div className="flex items-center space-x-2 text-sm text-secondary-500">
            <span>{article.category}</span>
            <span>•</span>
            <span>{formatDate(article.created_at)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-3">
          {article.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="space-x-1">
            <span>↑</span>
            <span>{article.upvotes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="space-x-1">
            <span>↓</span>
            <span>{article.downvotes}</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2 text-sm text-secondary-500">
          <span>By</span>
          <Link href={`/user/${article.submitted_by}`} className="hover:underline">
            {article.submitted_by}
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
} 