"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Edit, Save, X, Trash2 } from "lucide-react"
import type { Group } from "@/types/student"

interface GroupCardProps {
  group: Group
  editingGroup: string | null
  editGroupName: string
  onStartEdit: (groupId: string, currentName: string) => void
  onSaveEdit: (groupId: string, newName: string) => void
  onCancelEdit: () => void
  onRemoveGroup: (groupId: string) => void
  onRemoveStudentFromGroup: (groupId: string, studentName: string) => void
  setEditGroupName: (name: string) => void
}

export function GroupCard({
  group,
  editingGroup,
  editGroupName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemoveGroup,
  onRemoveStudentFromGroup,
  setEditGroupName,
}: GroupCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          {editingGroup === group.id ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                className="text-lg font-semibold"
              />
              <Button size="sm" onClick={() => onSaveEdit(group.id, editGroupName)} disabled={!editGroupName.trim()}>
                <Save className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancelEdit}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <CardTitle className="text-lg">{group.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => onStartEdit(group.id, group.name)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveGroup(group.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
        <CardDescription>{group.students.length} students</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Students</h4>
          <div className="space-y-1">
            {group.students.map((studentName) => (
              <div key={studentName} className="flex items-center justify-between text-sm">
                <span>{studentName}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveStudentFromGroup(group.id, studentName)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Group Traits</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Extroverts:</span>
              <Badge variant="outline" className="text-xs">
                {group.traits.extroverts}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Leaders:</span>
              <Badge variant="outline" className="text-xs">
                {group.traits.leaders}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Collaborative:</span>
              <Badge variant="outline" className="text-xs">
                {group.traits.collaborative}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Visual:</span>
              <Badge variant="outline" className="text-xs">
                {group.traits.visualLearners}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
