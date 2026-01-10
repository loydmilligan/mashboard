export interface Fragment {
  id: string
  file_name: string
  code: string
  language: string
  position: number
}

export interface Snippet {
  id: string
  title: string
  description?: string
  categories: string[]
  fragments: Fragment[]
  created_at: string
  updated_at: string
}

export interface SnippetSearchResult {
  id: string
  title: string
  description?: string
  categories: string[]
  language: string // Primary language from first fragment
}

export interface CreateSnippetInput {
  title: string
  description?: string
  categories?: string[]
  fragments: {
    file_name: string
    code: string
    language: string
  }[]
}
