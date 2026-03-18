import { KBArticleDetail } from '../../../src/app/pages/KBArticleDetail';

export const metadata = {
  title: 'Article Details - AvoGuard',
  description: 'Knowledge base article details',
};

export default function ArticleDetailPage({ params }: { params: { articleId: string } }) {
  return <KBArticleDetail />;
}
