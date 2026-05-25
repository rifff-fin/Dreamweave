import { api } from "@/services/api";
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, MapPin, X } from 'lucide-react';
import type { PostCategory, PostVisibility } from '@/types/noctis';
import { useAuth } from "@/context/AuthContext";

interface LocationResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
  display_name: string;
  type: string;
  division: string;
}


const BANGLADESH_BOUNDS = {
  south: 20.5,
  north: 26.6,
  west: 88.0,
  east: 92.7
};

// Fallback hardcoded locations for Bangladesh
const FALLBACK_LOCATIONS: LocationResult[] = [
  { id: 'dhaka-city', name: 'Dhaka City', lat: 23.8103, lon: 90.4125, display_name: 'Dhaka, Bangladesh', type: 'city', division: 'Dhaka' },
  { id: 'chattogram-city', name: 'Chattogram', lat: 22.3569, lon: 91.7832, display_name: 'Chattogram, Bangladesh', type: 'city', division: 'Chattogram' },
  { id: 'khulna-city', name: 'Khulna', lat: 22.8456, lon: 89.5630, display_name: 'Khulna, Bangladesh', type: 'city', division: 'Khulna' },
  { id: 'rajshahi-city', name: 'Rajshahi', lat: 24.3745, lon: 88.6042, display_name: 'Rajshahi, Bangladesh', type: 'city', division: 'Rajshahi' },
  { id: 'sylhet-city', name: 'Sylhet', lat: 24.8949, lon: 91.8687, display_name: 'Sylhet, Bangladesh', type: 'city', division: 'Sylhet' },
  { id: 'barisal-city', name: 'Barisal', lat: 22.7011, lon: 90.3535, display_name: 'Barisal, Bangladesh', type: 'city', division: 'Barisal' },
  { id: 'rangpur-city', name: 'Rangpur', lat: 25.7479, lon: 89.2525, display_name: 'Rangpur, Bangladesh', type: 'city', division: 'Rangpur' },
  { id: 'cox-bazaar', name: 'Cox\'s Bazaar', lat: 21.4436, lon: 92.0084, display_name: 'Cox\'s Bazaar, Bangladesh', type: 'city', division: 'Chattogram' },
  { id: 'dhanmondi', name: 'Dhanmondi', lat: 23.7475, lon: 90.3652, display_name: 'Dhanmondi, Dhaka', type: 'area', division: 'Dhaka' },
  { id: 'gulshan', name: 'Gulshan', lat: 23.8119, lon: 90.4137, display_name: 'Gulshan, Dhaka', type: 'area', division: 'Dhaka' },
  { id: 'banani', name: 'Banani', lat: 23.8289, lon: 90.4131, display_name: 'Banani, Dhaka', type: 'area', division: 'Dhaka' },
  { id: 'uttara', name: 'Uttara', lat: 23.8769, lon: 90.3950, display_name: 'Uttara, Dhaka', type: 'area', division: 'Dhaka' },
  { id: 'mirpur', name: 'Mirpur', lat: 23.8139, lon: 90.3560, display_name: 'Mirpur, Dhaka', type: 'area', division: 'Dhaka' },
  { id: 'bashundhara', name: 'Bashundhara', lat: 23.8597, lon: 90.4337, display_name: 'Bashundhara, Dhaka', type: 'area', division: 'Dhaka' },
  { id: 'motijheel', name: 'Motijheel', lat: 23.7669, lon: 90.3958, display_name: 'Motijheel, Dhaka', type: 'area', division: 'Dhaka' },
];

// Function to extract division from display_name
const extractDivision = (displayName: string): string => {
  const divisions = ['Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Barisal', 'Rajshahi', 'Rangpur'];
  for (const division of divisions) {
    if (displayName.toLowerCase().includes(division.toLowerCase())) {
      return division;
    }
  }
  return 'Bangladesh';
};

const DreamForm = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PostCategory>('dream');
  const [tags, setTags] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [isLucid, setIsLucid] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced location search
  useEffect(() => {
    if (locationSearch.length < 1) {
      setLocationResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          new URLSearchParams({
            q: `${locationSearch}, Bangladesh`,
            format: 'json',
            limit: '10',
            countrycodes: 'BD',
            addressdetails: '1'
          })
        );

        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();

        let results: LocationResult[] = data.map((item: any) => ({
          id: item.place_id.toString(),
          name: item.display_name.split(',')[0]?.trim() || item.display_name.split(',')[1]?.trim() || item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          display_name: item.display_name,
          type: item.type || 'place',
          division: extractDivision(item.display_name)
        }));

        // If API returns no results, use fallback locations
        if (results.length === 0) {
          const query = locationSearch.toLowerCase();
          results = FALLBACK_LOCATIONS.filter(loc =>
            loc.name.toLowerCase().includes(query) ||
            loc.display_name.toLowerCase().includes(query)
          ).slice(0, 10);
        }

        setLocationResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Location search error:', error);
        // Fallback to local search on API failure
        const query = locationSearch.toLowerCase();
        const fallbackResults = FALLBACK_LOCATIONS.filter(loc =>
          loc.name.toLowerCase().includes(query) ||
          loc.display_name.toLowerCase().includes(query)
        ).slice(0, 10);
        setLocationResults(fallbackResults);
        setShowResults(true);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [locationSearch]);

  const handleLocationSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocationSearch(query);
    setShowResults(query.length >= 1);
  };

  const handleSelectLocation = (location: LocationResult) => {
    setSelectedLocation(location);
    setLocationSearch(location.name);
    setShowResults(false);
  };

  const clearLocation = () => {
    setSelectedLocation(null);
    setLocationSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLocation) {
      alert("Please select a location");
      return;
    }

    const payload = {
      title,
      description,
      category,
      tags: tags.split(",").map((t) => t.trim()).filter((t) => t),
      location: selectedLocation.display_name,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lon,
      locationType: selectedLocation.type,
      division: selectedLocation.division,
      city: selectedLocation.division,
      area: selectedLocation.name,
      visibility,
      isLucid,
      isRecurring,
      userId: userId || (user as any)?._id,
      authorName: user?.username || (user as any)?._id || 'Anonymous',
    };

    setIsSubmitting(true);

    try {
      await api.post("/posts", payload);

      alert("Dream submitted successfully!");

      // Dispatch event to update profile stats
      window.dispatchEvent(new CustomEvent('dreamSubmitted'));

      // Reset form
      setTitle("");
      setDescription("");
      setTags("");
      setLocationSearch("");
      setSelectedLocation(null);
      setIsLucid(false);
      setIsRecurring(false);
      setCategory("dream");
      setVisibility("public");
    } catch (error) {
      console.error(error);
      alert("Failed to submit dream");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClass = "w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all";
  const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What did you experience?" className="border-border bg-secondary" required />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe it in detail..." rows={5} className="border-border bg-secondary" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as PostCategory)} className={selectClass}>
            <option value="dream">🌙 Dream</option>
            <option value="myth">📜 Myth</option>
            <option value="paranormal">👁️ Paranormal</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Visibility</label>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as PostVisibility)} className={selectClass}>
            <option value="public">Public</option>
            <option value="friends">Friends Only</option>
            <option value="anonymous">Anonymous</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Tags (comma separated)</label>
        <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="recurring, water, shadow" className="border-border bg-secondary" />
      </div>

      {/* Location Search */}
      <div>
        <label className={labelClass}>📍 Location (Bangladesh)</label>
        <div className="relative">
          <div className="flex items-center gap-2">
            <Input
              value={locationSearch}
              onChange={handleLocationSearchChange}
              placeholder="Search any location in Bangladesh... (e.g., Dhanmondi, Cox's Bazaar, Sylhet)"
              className="border-border bg-secondary flex-1"
              autoComplete="off"
              required={!selectedLocation}
              onFocus={() => locationSearch.length >= 1 && setShowResults(true)}
            />
            {selectedLocation && (
              <button
                type="button"
                onClick={clearLocation}
                className="p-1.5 rounded hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Location Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-secondary shadow-lg z-50">
              {isSearching ? (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : locationResults.length > 0 ? (
                locationResults.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => handleSelectLocation(location)}
                    className="w-full text-left px-3 py-2.5 hover:bg-primary/10 transition-colors border-b border-border/50 last:border-0"
                  >
                    <div className="text-sm font-medium text-foreground">{location.name}</div>
                    <div className="text-xs text-muted-foreground">{location.division} • {location.type}</div>
                  </button>
                ))
              ) : locationSearch.length >= 2 ? (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  No locations found in Bangladesh
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="mt-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{selectedLocation.name}</div>
                <div className="text-xs text-muted-foreground">{selectedLocation.division}</div>
                <div className="text-xs text-primary/70 mt-1">
                  {selectedLocation.lat.toFixed(4)}°, {selectedLocation.lon.toFixed(4)}°
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-5 text-sm text-muted-foreground">
        <label className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors">
          <input type="checkbox" checked={isLucid} onChange={() => setIsLucid(!isLucid)} className="accent-primary" />
          ✨ Lucid
        </label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors">
          <input type="checkbox" checked={isRecurring} onChange={() => setIsRecurring(!isRecurring)} className="accent-primary" />
          🔄 Recurring
        </label>
      </div>

      <Button type="submit" disabled={isSubmitting || !selectedLocation} className="w-full btn-primary h-10 text-sm font-medium rounded-lg">
        <Send className="h-4 w-4 mr-2" />
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
};

export default DreamForm;
