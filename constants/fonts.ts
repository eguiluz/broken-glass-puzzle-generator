export interface FontOption {
    value: string
    label: string
    fallback: string
}

export const SYSTEM_FONTS: FontOption[] = [
    { value: "Arial", label: "Arial", fallback: "Arial, sans-serif" },
    { value: "Helvetica", label: "Helvetica", fallback: "Helvetica, sans-serif" },
    { value: "Times New Roman", label: "Times New Roman", fallback: "Times New Roman, serif" },
    { value: "Georgia", label: "Georgia", fallback: "Georgia, serif" },
    { value: "Courier New", label: "Courier New", fallback: "Courier New, monospace" },
    { value: "Verdana", label: "Verdana", fallback: "Verdana, sans-serif" },
    { value: "Trebuchet MS", label: "Trebuchet MS", fallback: "Trebuchet MS, sans-serif" },
    { value: "Comic Sans MS", label: "Comic Sans MS", fallback: "Comic Sans MS, cursive" },
    { value: "Impact", label: "Impact", fallback: "Impact, sans-serif" },
    { value: "Palatino", label: "Palatino", fallback: "Palatino, serif" },
    { value: "Garamond", label: "Garamond", fallback: "Garamond, serif" },
    { value: "Bookman", label: "Bookman", fallback: "Bookman, serif" },
    { value: "Avant Garde", label: "Avant Garde", fallback: "Avant Garde, sans-serif" },
    { value: "Brush Script MT", label: "Brush Script MT", fallback: "Brush Script MT, cursive" },
    { value: "Lucida Console", label: "Lucida Console", fallback: "Lucida Console, monospace" },
    { value: "Monaco", label: "Monaco", fallback: "Monaco, monospace" },
    { value: "Consolas", label: "Consolas", fallback: "Consolas, monospace" },
    { value: "Cambria", label: "Cambria", fallback: "Cambria, serif" },
    { value: "Calibri", label: "Calibri", fallback: "Calibri, sans-serif" },
    { value: "Futura", label: "Futura", fallback: "Futura, sans-serif" },
]
