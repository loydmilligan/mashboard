import { useState, useCallback } from 'react'
import {
  Globe,
  FileText,
  File,
  Youtube,
  Terminal,
  Upload,
  Loader2,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { taskResourcesService } from '@/services/taskResources'
import type { CreateTaskResourcePayload } from '@/types/taskResource'
import { extractYoutubeVideoId } from '@/types/taskResource'
import { cn } from '@/lib/utils'

interface AddResourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string
  onResourceAdded?: () => void
}

type TabValue = 'weblink' | 'youtube' | 'file' | 'notemark' | 'ssh'

export function AddResourceDialog({
  open,
  onOpenChange,
  taskId,
  onResourceAdded,
}: AddResourceDialogProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('weblink')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states for each type
  const [weblinkUrl, setWeblinkUrl] = useState('')
  const [weblinkTitle, setWeblinkTitle] = useState('')

  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [youtubeTitle, setYoutubeTitle] = useState('')

  const [notemarkId, setNotemarkId] = useState('')
  const [notemarkTitle, setNotemarkTitle] = useState('')

  const [sshHost, setSshHost] = useState('')
  const [sshPort, setSshPort] = useState('22')
  const [sshUser, setSshUser] = useState('')
  const [sshTitle, setSshTitle] = useState('')

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileTitle, setFileTitle] = useState('')
  const [uploadProgress, setUploadProgress] = useState(false)

  const resetForm = () => {
    setWeblinkUrl('')
    setWeblinkTitle('')
    setYoutubeUrl('')
    setYoutubeTitle('')
    setNotemarkId('')
    setNotemarkTitle('')
    setSshHost('')
    setSshPort('22')
    setSshUser('')
    setSshTitle('')
    setUploadedFile(null)
    setFileTitle('')
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setFileTitle(file.name)
    }
  }, [])

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setUploadedFile(file)
      setFileTitle(file.name)
    }
  }, [])

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)

    try {
      let payload: CreateTaskResourcePayload

      switch (activeTab) {
        case 'weblink':
          if (!weblinkUrl) throw new Error('URL is required')
          payload = {
            resource_type: 'weblink',
            title: weblinkTitle || new URL(weblinkUrl).hostname,
            config: { url: weblinkUrl },
          }
          break

        case 'youtube':
          if (!youtubeUrl) throw new Error('YouTube URL is required')
          const videoId = extractYoutubeVideoId(youtubeUrl)
          if (!videoId) throw new Error('Invalid YouTube URL')
          payload = {
            resource_type: 'youtube',
            title: youtubeTitle || `YouTube Video`,
            config: { videoId },
          }
          break

        case 'notemark':
          if (!notemarkId) throw new Error('Note ID is required')
          payload = {
            resource_type: 'notemark',
            title: notemarkTitle || 'Note',
            config: { noteId: notemarkId },
          }
          break

        case 'ssh':
          if (!sshHost || !sshUser) throw new Error('Host and username are required')
          payload = {
            resource_type: 'ssh',
            title: sshTitle || `${sshUser}@${sshHost}`,
            config: {
              host: sshHost,
              port: parseInt(sshPort) || 22,
              username: sshUser,
            },
          }
          break

        case 'file':
          if (!uploadedFile) throw new Error('Please select a file')
          setUploadProgress(true)

          // Upload the file first
          const uploaded = await taskResourcesService.uploadFile(uploadedFile)

          // Determine resource type from MIME
          const resourceType = taskResourcesService.getResourceTypeFromMime(
            uploadedFile.type
          )

          payload = {
            resource_type: resourceType,
            title: fileTitle || uploadedFile.name,
            config: {
              storageKey: uploaded.storage_key,
              originalName: uploaded.original_name,
              mimeType: uploaded.mime_type,
              sizeBytes: uploaded.size_bytes,
            },
          }
          setUploadProgress(false)
          break

        default:
          throw new Error('Invalid resource type')
      }

      await taskResourcesService.createResource(taskId, payload)
      onResourceAdded?.()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add resource')
      setUploadProgress(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Resource</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="weblink" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span className="hidden sm:inline">Link</span>
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-1">
              <Youtube className="h-3 w-3" />
              <span className="hidden sm:inline">YouTube</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-1">
              <File className="h-3 w-3" />
              <span className="hidden sm:inline">File</span>
            </TabsTrigger>
            <TabsTrigger value="notemark" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span className="hidden sm:inline">Note</span>
            </TabsTrigger>
            <TabsTrigger value="ssh" className="flex items-center gap-1">
              <Terminal className="h-3 w-3" />
              <span className="hidden sm:inline">SSH</span>
            </TabsTrigger>
          </TabsList>

          {/* Weblink */}
          <TabsContent value="weblink" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="weblink-url">URL</Label>
              <Input
                id="weblink-url"
                placeholder="https://example.com"
                value={weblinkUrl}
                onChange={(e) => setWeblinkUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weblink-title">Title (optional)</Label>
              <Input
                id="weblink-title"
                placeholder="My Link"
                value={weblinkTitle}
                onChange={(e) => setWeblinkTitle(e.target.value)}
              />
            </div>
          </TabsContent>

          {/* YouTube */}
          <TabsContent value="youtube" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <Input
                id="youtube-url"
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube-title">Title (optional)</Label>
              <Input
                id="youtube-title"
                placeholder="Video Title"
                value={youtubeTitle}
                onChange={(e) => setYoutubeTitle(e.target.value)}
              />
            </div>
          </TabsContent>

          {/* File Upload */}
          <TabsContent value="file" className="space-y-4 pt-4">
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center',
                'hover:border-primary/50 transition-colors cursor-pointer',
                uploadedFile && 'border-primary bg-primary/5'
              )}
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
              {uploadedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <File className="h-5 w-5 text-primary" />
                  <span className="text-sm">{uploadedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation()
                      setUploadedFile(null)
                      setFileTitle('')
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drop a file here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Images, PDFs, code files, audio, CSV
                  </p>
                </>
              )}
            </div>
            {uploadedFile && (
              <div className="space-y-2">
                <Label htmlFor="file-title">Title</Label>
                <Input
                  id="file-title"
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                />
              </div>
            )}
          </TabsContent>

          {/* NoteMark */}
          <TabsContent value="notemark" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="notemark-id">Note ID</Label>
              <Input
                id="notemark-id"
                placeholder="Note UUID"
                value={notemarkId}
                onChange={(e) => setNotemarkId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notemark-title">Title (optional)</Label>
              <Input
                id="notemark-title"
                placeholder="My Note"
                value={notemarkTitle}
                onChange={(e) => setNotemarkTitle(e.target.value)}
              />
            </div>
          </TabsContent>

          {/* SSH */}
          <TabsContent value="ssh" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ssh-host">Host</Label>
                <Input
                  id="ssh-host"
                  placeholder="192.168.1.100"
                  value={sshHost}
                  onChange={(e) => setSshHost(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ssh-port">Port</Label>
                <Input
                  id="ssh-port"
                  placeholder="22"
                  value={sshPort}
                  onChange={(e) => setSshPort(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ssh-user">Username</Label>
              <Input
                id="ssh-user"
                placeholder="ubuntu"
                value={sshUser}
                onChange={(e) => setSshUser(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ssh-title">Title (optional)</Label>
              <Input
                id="ssh-title"
                placeholder="My Server"
                value={sshTitle}
                onChange={(e) => setSshTitle(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || uploadProgress}>
            {(loading || uploadProgress) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add Resource
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddResourceDialog
