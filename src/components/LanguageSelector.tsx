import { useTranslation } from 'react-i18next';
import { languages } from '@/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe, ChevronDown } from 'lucide-react';

export const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1.5 px-2 sm:px-3 min-w-0"
        >
          <Globe className="h-4 w-4 shrink-0" />
          <span className="text-lg">{currentLanguage.flag}</span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[160px] max-h-[70vh] overflow-y-auto"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`cursor-pointer py-2.5 ${i18n.language === lang.code ? 'bg-accent font-medium' : ''}`}
          >
            <span className="mr-2.5 text-lg">{lang.flag}</span>
            <span className="text-sm">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
