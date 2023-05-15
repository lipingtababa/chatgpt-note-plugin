import Link from 'next/link'

export default function Page() {
  return (
    <div>
      <h1>Next.js + AWS S3</h1>
      <p>
        {' '}
        这是瑞典马工的范例网站， 用于展示怎么提供一个可以供chatgpt
        plugin调用的API接口{' '}
      </p>
      <p>
        {' '}
        你可以在这里查看 <Link href="/api/todos"> 我的todo list </Link>{' '}
      </p>
      <p>
        {' '}
        你可以在这里查看 <Link href="/api/todos/?id=1">
          {' '}
          我的第一个todo{' '}
        </Link>{' '}
      </p>
    </div>
  )
}
