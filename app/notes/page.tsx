"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Download, Trash2 } from "lucide-react"
import { useSubjects } from "@/hooks/use-subjects"
import { useNotes } from "@/hooks/use-notes"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function NotesPage() {
  const { subjects } = useSubjects()
  const { notes, uploadNote, deleteNote } = useNotes()
  const { toast } = useToast()
  const router = useRouter()

  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileUpload = () => {
    if (selectedSubject && selectedFile) {
      const subject = subjects.find((s) => s.id.toString() === selectedSubject)
      if (subject) {
        const newNote = {
          id: Date.now(),
          subjectName: subject.name,
          fileName: selectedFile.name,
          uploadDate: new Date().toISOString().split("T")[0],
          size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        }
        uploadNote(newNote)
        setSelectedSubject("")
        setSelectedFile(null)
        // Reset file input
        const fileInput = document.getElementById("file-input") as HTMLInputElement
        if (fileInput) fileInput.value = ""

        toast({
          title: "File Uploaded",
          description: `${selectedFile.name} has been uploaded successfully.`,
        })
      }
    }
  }

  const handleDeleteNote = (id: number, fileName: string) => {
    if (confirm(`Are you sure you want to delete ${fileName}?`)) {
      deleteNote(id)
      toast({
        title: "File Deleted",
        description: `${fileName} has been removed.`,
        variant: "destructive",
      })
    }
  }

  const handleDownload = (fileName: string) => {
    // In a real app, this would download the actual file
    toast({
      title: "Download Started",
      description: `Downloading ${fileName}...`,
    })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-yellow-400">PDF Notes Upload</h1>
        </div>

        {/* Upload Form */}
        <Card className="bg-black border-yellow-400/30 golden-glow">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload New PDF
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Select Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="bg-black border-yellow-400/50 text-white">
                    <SelectValue placeholder="Choose subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-yellow-400/50">
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.id}
                        value={subject.id.toString()}
                        className="text-white hover:bg-yellow-400/10"
                      >
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Select PDF File</Label>
                <Input
                  id="file-input"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="bg-black border-yellow-400/50 text-white file:bg-yellow-400 file:text-black file:border-0 file:rounded file:px-3 file:py-1"
                />
              </div>
            </div>
            <Button onClick={handleFileUpload} className="golden-button" disabled={!selectedSubject || !selectedFile}>
              <Upload className="w-4 h-4 mr-2" />
              Upload PDF
            </Button>
          </CardContent>
        </Card>

        {/* Uploaded Files List */}
        {notes.length === 0 ? (
          <Card className="bg-black border-yellow-400/30 golden-glow">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-yellow-400/10 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-yellow-400" />
                </div>
                <h2 className="text-xl font-bold text-yellow-400">No Files Uploaded</h2>
                <p className="text-gray-400">
                  Upload your first PDF note using the form above. You'll need to have subjects added first.
                </p>
                {subjects.length === 0 && (
                  <Button onClick={() => router.push("/subjects")} className="golden-button mt-4">
                    Add Subjects First
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-black border-yellow-400/30 golden-glow">
            <CardHeader>
              <CardTitle className="text-xl text-yellow-400">Uploaded Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-4 border border-yellow-400/20 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="w-8 h-8 text-yellow-400" />
                      <div>
                        <h3 className="text-white font-medium">{note.fileName}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{note.subjectName}</span>
                          <span>•</span>
                          <span>{note.uploadDate}</span>
                          <span>•</span>
                          <span>{note.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-yellow-400 hover:bg-yellow-400/10"
                        onClick={() => handleDownload(note.fileName)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id, note.fileName)}
                        className="text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
