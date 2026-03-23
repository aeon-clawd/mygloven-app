import { Sparkles, Upload } from 'lucide-react'

export default function StudioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">Space Studio</h2>
        <span className="px-2.5 py-1 bg-coral/15 text-coral text-xs font-semibold rounded-full border border-coral/25">
          Coming Soon
        </span>
      </div>

      <div className="bg-surface rounded-xl border border-border p-8 text-center max-w-2xl mx-auto">
        <div className="p-4 bg-coral/10 rounded-2xl w-fit mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-coral" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Visualize your event space with AI-powered rendering
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto mb-8">
          Upload floor plans or photos of your venue and let our AI help you
          visualize different layouts, lighting setups, and stage configurations
          for your next event.
        </p>

        {/* Upload Area Placeholder */}
        <div className="border-2 border-dashed border-border rounded-xl p-10 hover:border-coral/30 transition-colors cursor-pointer group">
          <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3 group-hover:text-coral transition-colors" />
          <p className="text-sm text-gray-400 mb-1">
            Drag and drop your floor plan or venue photos
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG up to 10MB
          </p>
        </div>

        <p className="text-xs text-gray-600 mt-6">
          This feature is currently in development. Stay tuned for updates.
        </p>
      </div>
    </div>
  )
}
