/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from '@abge/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@abge/ui/components/ui/card';
import { Input } from '@abge/ui/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@abge/ui/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@abge/ui/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@abge/ui/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@abge/ui/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@abge/ui/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@abge/ui/components/ui/tabs';
import { Badge } from '@abge/ui/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@abge/ui/components/ui/avatar';
import { Skeleton } from '@abge/ui/components/ui/skeleton';
import { toast } from "sonner";
import { EmptyState } from '@abge/ui/components/ui/empty-state';
import { Search, Moon, Sun, ArrowRight, FolderOpen, Check } from "lucide-react";

export default function DesignSystemPage() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans pb-32">
      <div className="max-w-6xl mx-auto space-y-16">
        <header className="flex items-center justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Design System</h1>
            <p className="text-muted-foreground">Component library and tokens for the AI Brand Growth Engine.</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-5 w-5 dark:hidden" />
            <Moon className="h-5 w-5 hidden dark:block" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </header>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">1. Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-background border border-border shadow-sm flex flex-col justify-end h-24">
              <span className="text-sm font-medium">Background</span>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border text-card-foreground shadow-sm flex flex-col justify-end h-24">
              <span className="text-sm font-medium">Card</span>
            </div>
            <div className="p-4 rounded-xl bg-primary text-primary-foreground shadow-sm flex flex-col justify-end h-24">
              <span className="text-sm font-medium">Primary</span>
            </div>
            <div className="p-4 rounded-xl bg-secondary text-secondary-foreground border border-border shadow-sm flex flex-col justify-end h-24">
              <span className="text-sm font-medium">Secondary</span>
            </div>
            <div className="p-4 rounded-xl bg-muted text-muted-foreground border border-border shadow-sm flex flex-col justify-end h-24">
              <span className="text-sm font-medium">Muted</span>
            </div>
            <div className="p-4 rounded-xl bg-accent text-accent-foreground border border-border shadow-sm flex flex-col justify-end h-24">
              <span className="text-sm font-medium">Accent</span>
            </div>
            <div className="p-4 rounded-xl bg-destructive text-destructive-foreground shadow-sm flex flex-col justify-end h-24">
              <span className="text-sm font-medium">Destructive</span>
            </div>
            <div className="p-4 rounded-xl border border-ring shadow-sm flex flex-col justify-end h-24">
              <span className="text-sm font-medium">Ring (Focus)</span>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">2. Typography</h2>
          <div className="space-y-4">
            <div className="flex flex-col"><span className="text-sm text-muted-foreground mb-1">Display (var--font-space)</span><h1 className="text-5xl font-extrabold tracking-tight">The quick brown fox</h1></div>
            <div className="flex flex-col"><span className="text-sm text-muted-foreground mb-1">H1</span><h1 className="text-4xl font-bold tracking-tight">The quick brown fox</h1></div>
            <div className="flex flex-col"><span className="text-sm text-muted-foreground mb-1">H2</span><h2 className="text-3xl font-semibold tracking-tight">The quick brown fox</h2></div>
            <div className="flex flex-col"><span className="text-sm text-muted-foreground mb-1">H3</span><h3 className="text-2xl font-semibold tracking-tight">The quick brown fox</h3></div>
            <div className="flex flex-col"><span className="text-sm text-muted-foreground mb-1">H4</span><h4 className="text-xl font-semibold tracking-tight">The quick brown fox</h4></div>
            <div className="flex flex-col"><span className="text-sm text-muted-foreground mb-1">Body</span><p className="text-base leading-7">The quick brown fox jumps over the lazy dog. It is a long established fact that a reader will be distracted.</p></div>
            <div className="flex flex-col"><span className="text-sm text-muted-foreground mb-1">Small</span><p className="text-sm font-medium leading-none">The quick brown fox jumps over the lazy dog.</p></div>
            <div className="flex flex-col"><span className="text-sm text-muted-foreground mb-1">Muted</span><p className="text-sm text-muted-foreground">The quick brown fox jumps over the lazy dog.</p></div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">4. Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex flex-wrap gap-4 items-center mt-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon"><ArrowRight className="h-4 w-4" /></Button>
            <Button disabled>Disabled</Button>
            <Button className="gap-2"><Search className="h-4 w-4" /> With Icon</Button>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">5. Cards & Shadows</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here. It provides additional context.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card content. This is the main body of the card.</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost">Cancel</Button>
                <Button>Save</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">6. Inputs & Forms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Input</label>
              <Input placeholder="Enter something..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Disabled Input</label>
              <Input disabled placeholder="Disabled..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">File Input</label>
              <Input type="file" />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">7. Select & Dropdowns</h2>
          <div className="flex gap-6">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="awareness">Brand Awareness</SelectItem>
                <SelectItem value="conversion">Conversion</SelectItem>
                <SelectItem value="retention">Retention</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline">Open Menu</Button>} />
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">9. Dialogs</h2>
          <div>
            <Dialog>
              <DialogTrigger render={<Button variant="outline">Open Dialog</Button>} />
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="name" className="text-right text-sm font-medium">
                      Name
                    </label>
                    <Input id="name" defaultValue="Jane Doe" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">10. Tooltips</h2>
          <div>
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline">Hover over me</Button>} />
              <TooltipContent>
                <p>This is a tooltip containing extra info.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">11. Tables</h2>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">INV001</TableCell>
                  <TableCell>Paid</TableCell>
                  <TableCell>Credit Card</TableCell>
                  <TableCell className="text-right">$250.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">INV002</TableCell>
                  <TableCell>Pending</TableCell>
                  <TableCell>PayPal</TableCell>
                  <TableCell className="text-right">$150.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">INV003</TableCell>
                  <TableCell>Unpaid</TableCell>
                  <TableCell>Bank Transfer</TableCell>
                  <TableCell className="text-right">$350.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">12. Tabs</h2>
          <div>
            <Tabs defaultValue="account" className="w-[400px]">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="settings" disabled>Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Make changes to your account here.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Input defaultValue="Jane Doe" />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your password here.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Input type="password" />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">13. Badges</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">14. Avatars</h2>
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">15. Skeletons</h2>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">16. Empty States</h2>
          <div className="max-w-2xl">
            <EmptyState 
              icon={FolderOpen}
              title="No campaigns found"
              description="You haven't created any marketing campaigns yet. Start by creating a new campaign to begin growing your brand."
              action={<Button>Create Campaign</Button>}
            />
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">17. Toasts (Sonner)</h2>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => toast("Event has been created")}>
              Default Toast
            </Button>
            <Button variant="outline" onClick={() => toast.success("Campaign published successfully")}>
              Success Toast
            </Button>
            <Button variant="outline" onClick={() => toast.error("Failed to connect to LinkedIn")}>
              Error Toast
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}
