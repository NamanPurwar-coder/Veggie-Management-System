export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="fixed bottom-0 right-0 w-full border-t py-3 mt-5 bg-background">
      <div className="container px-4 mx-auto">
        <div className="flex justify-center items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Naman. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}