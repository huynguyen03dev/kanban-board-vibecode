"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ThemeDemo() {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Color Palette</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-16 bg-background border rounded-md flex items-center justify-center">
                <span className="text-foreground text-sm">Background</span>
              </div>
              <p className="text-xs text-muted-foreground">background</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-16 bg-card border rounded-md flex items-center justify-center">
                <span className="text-card-foreground text-sm">Card</span>
              </div>
              <p className="text-xs text-muted-foreground">card</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-16 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground text-sm">Primary</span>
              </div>
              <p className="text-xs text-muted-foreground">primary</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-16 bg-secondary rounded-md flex items-center justify-center">
                <span className="text-secondary-foreground text-sm">Secondary</span>
              </div>
              <p className="text-xs text-muted-foreground">secondary</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-16 bg-muted rounded-md flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Muted</span>
              </div>
              <p className="text-xs text-muted-foreground">muted</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-16 bg-accent rounded-md flex items-center justify-center">
                <span className="text-accent-foreground text-sm">Accent</span>
              </div>
              <p className="text-xs text-muted-foreground">accent</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-16 bg-destructive rounded-md flex items-center justify-center">
                <span className="text-destructive-foreground text-sm">Destructive</span>
              </div>
              <p className="text-xs text-muted-foreground">destructive</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-16 border-2 border-border rounded-md flex items-center justify-center">
                <span className="text-foreground text-sm">Border</span>
              </div>
              <p className="text-xs text-muted-foreground">border</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Interactive Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          
          <div className="space-y-2">
            <Input placeholder="Input field with theme colors" />
            <Input placeholder="Disabled input" disabled />
          </div>
          
          <div className="space-y-2">
            <p className="text-foreground">Primary text (foreground)</p>
            <p className="text-muted-foreground">Muted text (muted-foreground)</p>
            <p className="text-destructive">Error text (destructive)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
