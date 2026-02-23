export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-2 px-4 h-12">
      <div className="container mx-auto flex items-center justify-center text-sm text-muted-foreground h-full">
        <span>Copyright © {new Date().getFullYear()} William Costa</span>
        <span className="mx-2">•</span>
        <a 
          href="https://williamcosta.dev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-primary underline transition-colors"
        >
          williamcosta.dev
        </a>
      </div>
    </footer>
  );
}
