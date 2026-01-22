export const venueTags = [
  // Amenities
  { id: 'free-wifi', name: 'Free Wi-Fi', category: 'amenities', icon: '📶' },
  { id: 'charging-points', name: 'Charging Points', category: 'amenities', icon: '🔌' },
  { id: 'on-site-parking', name: 'On-site Parking', category: 'amenities', icon: '🚗' },
  { id: 'bike-parking', name: 'Bike Parking', category: 'amenities', icon: '🚲' },
  { id: 'lockers-available', name: 'Lockers Available', category: 'amenities', icon: '🗄️' },
  { id: 'air-conditioning', name: 'Air Conditioning', category: 'amenities', icon: '❄️' },
  { id: 'heating', name: 'Heating', category: 'amenities', icon: '🔥' },
  { id: 'free-water', name: 'Free Water Station', category: 'amenities', icon: '💧' },
  { id: 'coat-check', name: 'Coat Check', category: 'amenities', icon: '🧥' },
  { id: 'free-newspapers', name: 'Free Newspapers', category: 'amenities', icon: '📰' },
  { id: 'book-exchange', name: 'Book Exchange', category: 'amenities', icon: '📚' },
  { id: 'board-games', name: 'Board Games', category: 'amenities', icon: '🎲' },
  { id: 'pool-table', name: 'Pool Table', category: 'amenities', icon: '🎱' },
  { id: 'dart-board', name: 'Dart Board', category: 'amenities', icon: '🎯' },
  { id: 'fireplace', name: 'Fireplace', category: 'amenities', icon: '🔥' },
  { id: 'blankets-available', name: 'Blankets Available', category: 'amenities', icon: '🛋️' },
  
  // Accessibility
  { id: 'accessible-entrance', name: 'Accessible Entrance', category: 'accessibility', icon: '♿' },
  { id: 'accessible-toilet', name: 'Accessible Toilet', category: 'accessibility', icon: '🚻' },
  { id: 'baby-changing', name: 'Baby Changing Facilities', category: 'accessibility', icon: '👶' },
  { id: 'high-chairs', name: 'High Chairs Available', category: 'accessibility', icon: '🪑' },
  { id: 'elevator-available', name: 'Elevator Available', category: 'accessibility', icon: '🛗' },
  { id: 'braille-menu', name: 'Braille Menu', category: 'accessibility', icon: '⠃' },
  { id: 'hearing-loop', name: 'Hearing Loop', category: 'accessibility', icon: '👂' },
  { id: 'guide-dogs-welcome', name: 'Guide Dogs Welcome', category: 'accessibility', icon: '🦮' },
  { id: 'gender-neutral-toilet', name: 'Gender Neutral Toilet', category: 'accessibility', icon: '🚻' },
  { id: 'nursing-room', name: 'Nursing/Pumping Room', category: 'accessibility', icon: '🍼' },
  
  // Seating & Space
  { id: 'outdoor-seating', name: 'Outdoor Seating', category: 'seating', icon: '🌞' },
  { id: 'indoor-seating', name: 'Indoor Seating', category: 'seating', icon: '🏠' },
  { id: 'rooftop-terrace', name: 'Rooftop Terrace', category: 'seating', icon: '🏙️' },
  { id: 'garden-patio', name: 'Garden/Patio', category: 'seating', icon: '🌿' },
  { id: 'heated-outdoor-area', name: 'Heated Outdoor Area', category: 'seating', icon: '🔥' },
  { id: 'covered-outdoor-area', name: 'Covered Outdoor Area', category: 'seating', icon: '☂️' },
  { id: 'communal-tables', name: 'Communal Tables', category: 'seating', icon: '👥' },
  { id: 'private-booths', name: 'Private Booths', category: 'seating', icon: '🛋️' },
  { id: 'standing-desks', name: 'Standing Desks', category: 'seating', icon: '🚶' },
  { id: 'quiet-zones', name: 'Quiet Zones', category: 'seating', icon: '🤫' },
  { id: 'window-seats', name: 'Window Seats', category: 'seating', icon: '🪟' },
  { id: 'bar-seating', name: 'Bar Seating', category: 'seating', icon: '🍺' },
  
  // Pet & Family Friendly
  { id: 'pet-friendly', name: 'Pet-friendly', category: 'social', icon: '🐕' },
  { id: 'family-friendly', name: 'Family-friendly', category: 'social', icon: '👨‍👩‍👧‍👦' },
  { id: 'dog-water-bowls', name: 'Dog Water Bowls', category: 'social', icon: '🐕' },
  { id: 'dog-treats', name: 'Dog Treats Available', category: 'social', icon: '🦴' },
  { id: 'kids-menu', name: 'Kids Menu', category: 'social', icon: '🧒' },
  { id: 'kids-play-area', name: 'Kids Play Area', category: 'social', icon: '🎈' },
  { id: 'kids-activities', name: 'Kids Activities', category: 'social', icon: '🎨' },
  { id: 'stroller-friendly', name: 'Stroller Friendly', category: 'social', icon: '👶' },
  
  // Food & Service
  { id: 'takeaway-service', name: 'Takeaway Service', category: 'service', icon: '🥤' },
  { id: 'table-service', name: 'Table Service', category: 'service', icon: '🍽️' },
  { id: 'self-service', name: 'Self Service', category: 'service', icon: '🚶' },
  { id: 'delivery-available', name: 'Delivery Available', category: 'service', icon: '🚚' },
  { id: 'online-ordering', name: 'Online Ordering', category: 'service', icon: '📱' },
  { id: 'reservation-required', name: 'Reservation Required', category: 'service', icon: '📅' },
  { id: 'walk-ins-welcome', name: 'Walk-ins Welcome', category: 'service', icon: '🚪' },
  { id: 'catering-available', name: 'Catering Available', category: 'service', icon: '🍱' },
  { id: 'vegetarian-options', name: 'Vegetarian Options', category: 'food', icon: '🥗' },
  { id: 'vegan-options', name: 'Vegan Options', category: 'food', icon: '🌱' },
  { id: 'gluten-free-options', name: 'Gluten-free Options', category: 'food', icon: '🌾' },
  { id: 'halal-options', name: 'Halal Options', category: 'food', icon: '🥘' },
  { id: 'kosher-options', name: 'Kosher Options', category: 'food', icon: '✡️' },
  { id: 'organic-options', name: 'Organic Options', category: 'food', icon: '🌿' },
  { id: 'locally-sourced', name: 'Locally Sourced', category: 'food', icon: '🌱' },
  { id: 'breakfast-served', name: 'Breakfast Served', category: 'food', icon: '🍳' },
  { id: 'brunch-served', name: 'Brunch Served', category: 'food', icon: '🥞' },
  { id: 'lunch-served', name: 'Lunch Served', category: 'food', icon: '🥪' },
  { id: 'dinner-served', name: 'Dinner Served', category: 'food', icon: '🍽️' },
  { id: 'all-day-breakfast', name: 'All Day Breakfast', category: 'food', icon: '☀️' },
  { id: 'snacks-only', name: 'Snacks Only', category: 'food', icon: '🥨' },
  { id: 'fresh-pastries', name: 'Fresh Pastries', category: 'food', icon: '🥐' },
  { id: 'healthy-options', name: 'Healthy Options', category: 'food', icon: '🥑' },
  
  // Beverages
  { id: 'alcohol-served', name: 'Alcohol Served', category: 'beverage', icon: '🍺' },
  { id: 'non-alcoholic-options', name: 'Non-alcoholic Options', category: 'beverage', icon: '🥤' },
  { id: 'specialty-coffee', name: 'Specialty Coffee', category: 'beverage', icon: '☕' },
  { id: 'tea-selection', name: 'Tea Selection', category: 'beverage', icon: '🍵' },
  { id: 'fresh-juice', name: 'Fresh Juice', category: 'beverage', icon: '🥤' },
  { id: 'smoothies', name: 'Smoothies', category: 'beverage', icon: '🥤' },
  { id: 'craft-beer', name: 'Craft Beer', category: 'beverage', icon: '🍺' },
  { id: 'wine-selection', name: 'Wine Selection', category: 'beverage', icon: '🍷' },
  { id: 'cocktails', name: 'Cocktails', category: 'beverage', icon: '🍹' },
  { id: 'mocktails', name: 'Mocktails', category: 'beverage', icon: '🍹' },
  { id: 'kombucha', name: 'Kombucha', category: 'beverage', icon: '🥤' },
  { id: 'oat-milk', name: 'Oat Milk Available', category: 'beverage', icon: '🥛' },
  { id: 'alternative-milk', name: 'Alternative Milk Options', category: 'beverage', icon: '🥛' },
  
  // Work & Study
  { id: 'laptop-friendly', name: 'Laptop Friendly', category: 'work', icon: '💻' },
  { id: 'power-outlets', name: 'Power Outlets at Tables', category: 'work', icon: '🔌' },
  { id: 'printing-service', name: 'Printing Service', category: 'work', icon: '🖨️' },
  { id: 'meeting-rooms', name: 'Meeting Rooms', category: 'work', icon: '🏢' },
  { id: 'phone-booths', name: 'Phone Booths', category: 'work', icon: '📞' },
  { id: 'study-friendly', name: 'Study Friendly', category: 'work', icon: '📚' },
  { id: 'coworking-space', name: 'Coworking Space', category: 'work', icon: '💼' },
  { id: 'projector-available', name: 'Projector Available', category: 'work', icon: '📽️' },
  { id: 'whiteboard-available', name: 'Whiteboard Available', category: 'work', icon: '📝' },
  { id: 'scanner-available', name: 'Scanner Available', category: 'work', icon: '📄' },
  
  // Entertainment & Events
  { id: 'live-music', name: 'Live Music', category: 'entertainment', icon: '🎵' },
  { id: 'dj-nights', name: 'DJ Nights', category: 'entertainment', icon: '🎧' },
  { id: 'open-mic', name: 'Open Mic', category: 'entertainment', icon: '🎤' },
  { id: 'trivia-nights', name: 'Trivia Nights', category: 'entertainment', icon: '🧠' },
  { id: 'sports-on-tv', name: 'Sports on TV', category: 'entertainment', icon: '📺' },
  { id: 'karaoke', name: 'Karaoke', category: 'entertainment', icon: '🎤' },
  { id: 'poetry-nights', name: 'Poetry Nights', category: 'entertainment', icon: '📖' },
  { id: 'comedy-nights', name: 'Comedy Nights', category: 'entertainment', icon: '😂' },
  { id: 'book-club', name: 'Book Club', category: 'entertainment', icon: '📚' },
  { id: 'art-exhibitions', name: 'Art Exhibitions', category: 'entertainment', icon: '🎨' },
  { id: 'workshops', name: 'Workshops', category: 'entertainment', icon: '🛠️' },
  { id: 'movie-nights', name: 'Movie Nights', category: 'entertainment', icon: '🎬' },
  
  // Payment & Technology
  { id: 'cash-only', name: 'Cash Only', category: 'payment', icon: '💵' },
  { id: 'card-accepted', name: 'Card Accepted', category: 'payment', icon: '💳' },
  { id: 'contactless-payment', name: 'Contactless Payment', category: 'payment', icon: '📱' },
  { id: 'mobile-payment', name: 'Mobile Payment', category: 'payment', icon: '📱' },
  { id: 'qr-code-menu', name: 'QR Code Menu', category: 'payment', icon: '📱' },
  { id: 'app-ordering', name: 'App Ordering', category: 'payment', icon: '📱' },
  { id: 'loyalty-program', name: 'Loyalty Program', category: 'payment', icon: '⭐' },
  { id: 'student-discount', name: 'Student Discount', category: 'payment', icon: '🎓' },
  { id: 'senior-discount', name: 'Senior Discount', category: 'payment', icon: '👵' },
  
  // Atmosphere
  { id: 'quiet-atmosphere', name: 'Quiet Atmosphere', category: 'atmosphere', icon: '🤫' },
  { id: 'lively-atmosphere', name: 'Lively Atmosphere', category: 'atmosphere', icon: '🎉' },
  { id: 'romantic-setting', name: 'Romantic Setting', category: 'atmosphere', icon: '💕' },
  { id: 'casual-vibe', name: 'Casual Vibe', category: 'atmosphere', icon: '😊' },
  { id: 'upscale-ambiance', name: 'Upscale Ambiance', category: 'atmosphere', icon: '✨' },
  { id: 'historic-building', name: 'Historic Building', category: 'atmosphere', icon: '🏛️' },
  { id: 'modern-design', name: 'Modern Design', category: 'atmosphere', icon: '🏢' },
  { id: 'rustic-charm', name: 'Rustic Charm', category: 'atmosphere', icon: '🌾' },
  { id: 'industrial-style', name: 'Industrial Style', category: 'atmosphere', icon: '🏭' },
  { id: 'waterfront-view', name: 'Waterfront View', category: 'atmosphere', icon: '🌊' },
  { id: 'city-view', name: 'City View', category: 'atmosphere', icon: '🏙️' },
  { id: 'garden-view', name: 'Garden View', category: 'atmosphere', icon: '🌳' },
  
  // Hours & Timing
  { id: 'open-early', name: 'Open Early', category: 'hours', icon: '🌅' },
  { id: 'open-late', name: 'Open Late', category: 'hours', icon: '🌙' },
  { id: '24-hours', name: '24 Hours', category: 'hours', icon: '⏰' },
  { id: 'weekend-only', name: 'Weekend Only', category: 'hours', icon: '📅' },
  { id: 'weekday-only', name: 'Weekday Only', category: 'hours', icon: '📅' },
  { id: 'seasonal', name: 'Seasonal', category: 'hours', icon: '🍂' },
  
  // Sustainability
  { id: 'eco-friendly', name: 'Eco-friendly', category: 'sustainability', icon: '♻️' },
  { id: 'plastic-free', name: 'Plastic Free', category: 'sustainability', icon: '🌍' },
  { id: 'zero-waste', name: 'Zero Waste', category: 'sustainability', icon: '♻️' },
  { id: 'renewable-energy', name: 'Renewable Energy', category: 'sustainability', icon: '⚡' },
  { id: 'composting', name: 'Composting', category: 'sustainability', icon: '🌱' },
  { id: 'reusable-cups', name: 'Reusable Cups', category: 'sustainability', icon: '☕' },
  { id: 'byoc', name: 'Bring Your Own Cup', category: 'sustainability', icon: '☕' },
  { id: 'water-refill-station', name: 'Water Refill Station', category: 'sustainability', icon: '💧' }
];

export const tagCategories = [
  { id: 'amenities', name: 'Amenities', icon: '⚡' },
  { id: 'accessibility', name: 'Accessibility', icon: '♿' },
  { id: 'seating', name: 'Seating & Space', icon: '🪑' },
  { id: 'social', name: 'Pet & Family', icon: '👥' },
  { id: 'service', name: 'Service', icon: '🔔' },
  { id: 'food', name: 'Food Options', icon: '🍽️' },
  { id: 'beverage', name: 'Beverages', icon: '🥤' },
  { id: 'work', name: 'Work & Study', icon: '💻' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎵' },
  { id: 'payment', name: 'Payment & Tech', icon: '💳' },
  { id: 'atmosphere', name: 'Atmosphere', icon: '✨' },
  { id: 'hours', name: 'Hours', icon: '⏰' },
  { id: 'sustainability', name: 'Sustainability', icon: '♻️' }
];

export const getTagsByCategory = (categoryId) => {
  return venueTags.filter(tag => tag.category === categoryId);
};

export const getTagById = (tagId) => {
  return venueTags.find(tag => tag.id === tagId);
};

export const validateSelectedTags = (selectedTagIds) => {
  if (!Array.isArray(selectedTagIds)) return false;

  if (selectedTagIds.length > 20) return false;

  return selectedTagIds.every(tagId =>
    venueTags.some(tag => tag.id === tagId)
  );
};

export const getAllAvailableTags = () => {
  return venueTags;
};