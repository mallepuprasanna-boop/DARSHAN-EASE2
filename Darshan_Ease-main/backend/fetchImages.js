const fs = require('fs');
const https = require('https');

const templeData = [
  { templeName: 'Ram Mandir', location: 'Ayodhya, Uttar Pradesh', search: 'Ram Mandir, Ayodhya' },
  { templeName: 'Badrinath Temple', location: 'Chamoli, Uttarakhand', search: 'Badrinath Temple' },
  { templeName: 'Sun Temple', location: 'Konark, Odisha', search: 'Konark Sun Temple' },
  { templeName: 'Brihadeeswara Temple', location: 'Thanjavur, Tamil Nadu', search: 'Brihadisvara Temple, Thanjavur' },
  { templeName: 'Somnath Temple', location: 'Somnath Gujarat', search: 'Somnath temple' },
  { templeName: 'Kedarnath Temple', location: 'Rudraprayag, Uttarakhand', search: 'Kedarnath Temple' },
  { templeName: 'Sanchi Stupa', location: 'Sanchi, Madhya Pradesh', search: 'Sanchi' },
  { templeName: 'Ramanathaswamy Temple', location: 'Rameshwaram, Tamil Nadu', search: 'Ramanathaswamy Temple' },
  { templeName: 'Vaishno Devi Temple', location: 'Katra, Jammu and Kahsmir', search: 'Vaishno Devi' },
  { templeName: 'Siddhivinayak Temple', location: 'Mumbai, Maharashtra', search: 'Siddhivinayak Temple, Mumbai' },
  { templeName: 'Gangotri Temple', location: 'Uttarkashi, Uttarakhand', search: 'Gangotri' },
  { templeName: 'Golden Temple', location: 'Amritsar, Punjab', search: 'Golden Temple' },
  { templeName: 'Kashi Vishwanath Temple', location: 'Varanasi, Uttar Pradesh', search: 'Kashi Vishwanath Temple' },
  { templeName: 'Shri Jagannath Temple', location: 'Puri, Odisha', search: 'Jagannath Temple, Puri' },
  { templeName: 'Yamunotri Temple', location: 'Uttarkashi, Uttarakhand', search: 'Yamunotri' },
  { templeName: 'Meenakshi Temple', location: 'Madurai, Tamil Nadu', search: 'Meenakshi Temple' },
  { templeName: 'Amarnath Cave Temple', location: 'Jammu and Kashmir', search: 'Amarnath Temple' },
  { templeName: 'Lingaraja Temple', location: 'Bhubaneswar, Odisha', search: 'Lingaraja Temple' },
  { templeName: 'Tirupati Balaji Temple', location: 'Tirumala, Andhra Pradesh', search: 'Venkateswara Temple, Tirumala' },
  { templeName: 'Kanchipuram Temples', location: 'Kanchipuram, Tamil Nadu', search: 'Kanchipuram' },
  { templeName: 'Khajuraho Temple', location: 'Khajuraho, Madhya Pradesh', search: 'Khajuraho Group of Monuments' },
  { templeName: 'Virupaksha Temple', location: 'Hampi, Karnataka', search: 'Virupaksha Temple, Hampi' },
  { templeName: 'Akshardham Temple', location: 'Delhi, Delhi', search: 'Swaminarayan Akshardham (Delhi)' },
  { templeName: 'Shri Digambar Jain Lal Mandir', location: 'Delhi, Delhi', search: 'Shri Digambar Jain Lal Mandir' },
  { templeName: 'Mahavir Mandir', location: 'Patna, Bihar', search: 'Mahavir Mandir' },
  { templeName: 'Ranakpur Temple', location: 'Pali, Rajasthan', search: 'Ranakpur Jain temple' },
  { templeName: 'Shirdi Sai Baba Temple', location: 'Shirdi, Maharashtra', search: 'Sai Baba of Shirdi' },
  { templeName: 'Shri Padmanabhaswamy Temple', location: 'Trivendrum, Kerala', search: 'Padmanabhaswamy Temple' },
  { templeName: 'Dwarkadhish Temple', location: 'Dwarka, Gujarat', search: 'Dwarkadhish Temple' },
  { templeName: 'Laxminarayan Temple', location: 'Delhi, Delhi', search: 'Laxminarayan Temple' },
  { templeName: 'Iskcon Temple', location: 'Vrindavan, Uttar Pradesh', search: 'Krishna-Balaram Mandir' },
  { templeName: 'Mahabodhi Temple', location: 'Gaya, Bihar', search: 'Mahabodhi Temple' },
  { templeName: 'Kamakhya Temple', location: 'Guwahati, Assam', search: 'Kamakhya Temple' },
  { templeName: 'Neelkanth Mahadev Temple', location: 'Rishikesh, Uttarakhand', search: 'Neelkanth Mahadev Temple' },
  { templeName: 'Mukteswara Temple', location: 'Bhubaneswar, Odisha', search: 'Mukteshvara Temple, Bhubaneswar' },
  { templeName: 'Sri Ranganathaswamy Temple', location: 'Srirangam, Tamil Nadu', search: 'Ranganathaswamy Temple, Srirangam' },
  { templeName: 'Khatushyam Baba Temple', location: 'Sikar, Rajasthan', search: 'Khatushyam Temple' },
  { templeName: 'Salasar Balaji Temple', location: 'Churu, Rajasthan', search: 'Salasar Balaji' },
  { templeName: 'Dilwara Jain Temple', location: 'Mount Abu, Rajasthan', search: 'Dilwara Temples' },
  { templeName: 'Shri Mahakaleshwar Temple', location: 'Ujjain, Madhya Pradesh', search: 'Mahakaleshwar Jyotirlinga' }
];

const fetchImage = (searchTitle) => {
  return new Promise((resolve, reject) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(searchTitle)}&prop=pageimages&format=json&pithumbsize=1000`;
    const options = {
      headers: { 'User-Agent': 'DarshanEaseBot/1.0 (amars@example.com)' }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId && pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
            resolve(pages[pageId].thumbnail.source);
          } else {
            resolve('https://images.unsplash.com/photo-1548013146-72479768bbaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'); // fallback
          }
        } catch (e) {
          resolve('https://images.unsplash.com/photo-1548013146-72479768bbaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
        }
      });
    }).on('error', () => resolve('https://images.unsplash.com/photo-1548013146-72479768bbaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'));
  });
};

const run = async () => {
  for (let t of templeData) {
    let img = await fetchImage(t.search);
    t.image = img;
    console.log(`Fetched image for ${t.templeName}: ${img}`);
  }
  
  // Now write to a file that we can use to replace the seed.js content
  fs.writeFileSync('templeDataWithImages.json', JSON.stringify(templeData, null, 2));
  console.log('Done!');
};

run();
