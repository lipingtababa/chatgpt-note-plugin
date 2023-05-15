// pages/index.tsx
import type { NextPage } from 'next'
import React from 'react'
import Link from 'next/link'

const HomePage: NextPage = () => {
  return (
    <div>
      <h1>APIs for ChatGPT Plugin by magong.se</h1>
      <p> <Link href="/api/todos"> My todo list </Link> </p>
    </div>
  )
}

export default HomePage
