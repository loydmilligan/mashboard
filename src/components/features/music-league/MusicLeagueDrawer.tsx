import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useUIStore } from '@/stores/uiStore'
import { MusicLeagueStrategist } from './MusicLeagueStrategist'

export function MusicLeagueDrawer(): JSX.Element {
  const { musicLeagueDrawerOpen, setMusicLeagueDrawerOpen } = useUIStore()

  return (
    <Sheet open={musicLeagueDrawerOpen} onOpenChange={setMusicLeagueDrawerOpen}>
      <SheetContent
        side="bottom"
        className="h-[90vh] p-0 sm:h-[85vh]"
      >
        <div className="h-full overflow-hidden">
          <MusicLeagueStrategist />
        </div>
      </SheetContent>
    </Sheet>
  )
}
