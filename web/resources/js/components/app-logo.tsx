import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <AppLogoIcon className="size-6" />
            </div>
            <div className="ml-1 grid flex-1 text-left">
                <span className="truncate text-sm font-semibold tracking-tight">
                    ResearchGap AI
                </span>
                <span className="truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Evidence workspace
                </span>
            </div>
        </>
    );
}
