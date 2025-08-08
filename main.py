from flask import Flask, render_template, request, jsonify, send_from_directory
import random
import os
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Sample texts categorized by topics (English and Bangla)
TEXT_TOPICS = {
    "Introduction": {
        "English": [
            "Bangladesh is a South Asian country known for its rich natural beauty, fertile plains, and extensive river networks. Geographically, it is situated on the delta of the Ganges, Brahmaputra, and Meghna rivers, which flow into the Bay of Bengal. This unique positioning makes the country highly fertile, supporting agriculture as a major livelihood. However, it also exposes Bangladesh to frequent flooding and natural calamities such as cyclones and riverbank erosion. Despite these challenges, the people of Bangladesh are known for their resilience and adaptability. The nation's identity is deeply tied to its landscape, where rural life, rivers, and green fields form a central part of its cultural and social fabric.",
            "The history of Bangladesh is marked by a long and courageous struggle for self-determination. Formerly part of British India, the region became East Pakistan in 1947 during the partition. However, linguistic, cultural, and political discrimination by the West Pakistani leadership led to growing unrest. The Language Movement of 1952 was a major turning point, where several students sacrificed their lives to defend the right to speak Bengali. This eventually led to the Liberation War of 1971, a nine-month conflict that resulted in the creation of an independent Bangladesh. The war left deep scars but also instilled a strong sense of patriotism, unity, and pride among the people, which remains a defining feature of the nation to this day.",
            "Bangladesh boasts a vibrant culture enriched by centuries of tradition, art, and expression. The Bengali language is a core element of national identity and pride. Poets like Kazi Nazrul Islam and Rabindranath Tagore have significantly influenced the country's literary landscape. The nation celebrates numerous colorful festivals, including Pahela Baishakh (Bengali New Year), Eid-ul-Fitr, Eid-ul-Adha, and Durga Puja. Music, dance, folk art, and traditional cuisine also play vital roles in everyday life. In rural areas, traditional crafts such as nakshi kantha (embroidered quilts) and pottery still thrive. The culture of Bangladesh reflects a harmonious blend of modern values and deep-rooted customs that continue to evolve with each generation.",
        ],
        "Bangla": [
            "বাংলাদেশ দক্ষিণ এশিয়ার একটি সুন্দর দেশ। এটি সমৃদ্ধ সংস্কৃতি, প্রাণবন্ত ঐতিহ্য এবং অতিথিপরায়ণ মানুষের জন্য পরিচিত। ১৯৭১ সালে মুক্তিযুদ্ধের মাধ্যমে দেশটি স্বাধীনতা অর্জন করে। এরপর থেকে শিক্ষা, স্বাস্থ্য ও প্রযুক্তিতে বাংলাদেশ উল্লেখযোগ্য অগ্রগতি অর্জন করেছে। এর নদী, সবুজ মাঠ ও প্রাকৃতিক সৌন্দর্য বিশ্বব্যাপী দর্শনার্থীদের আকর্ষণ করে।",
            "বাংলাদেশের ইতিহাস সংগ্রাম ও দৃঢ়তার সাক্ষ্য বহন করে। প্রাচীন সভ্যতা থেকে আধুনিক সময় পর্যন্ত, এই দেশের মানুষ বহু চ্যালেঞ্জ অতিক্রম করেছে। আজ বাংলাদেশ দক্ষিণ এশিয়ার একটি আশাবাদী ও অগ্রসর দেশ, যেখানে তরুণ জনগোষ্ঠী ভবিষ্যৎ গড়ার জন্য প্রস্তুত।",
            "ঢাকা বাংলাদেশের রাজধানী এবং বিশ্বের অন্যতম ঘনবসতিপূর্ণ শহর। নানা চ্যালেঞ্জ থাকা সত্ত্বেও, ঢাকা একটি প্রাণবন্ত মহানগরী, যেখানে সংস্কৃতি, ইতিহাস ও সুযোগের সমাহার রয়েছে। ঐতিহাসিক স্থান, সুস্বাদু খাবার এবং অতিথিপরায়ণ মানুষ এই শহরের বিশেষত্ব।",
        ]
    },
    "Economy": {
        "English": [
            "Over the past few decades, Bangladesh has made remarkable progress in terms of economic growth and human development. Once considered one of the poorest countries in the world, it is now recognized as an emerging economy with steady GDP growth. The ready-made garments (RMG) industry is the country's largest export sector, providing employment to millions, especially women. Additionally, sectors like agriculture, IT, telecommunications, and remittance from overseas workers contribute significantly to the economy. The government has also launched large-scale infrastructure projects, such as the Padma Bridge, to boost connectivity and commerce. However, challenges remain, including political instability, corruption, urban congestion, and climate change threats, which require ongoing attention and innovation.",
            "Education is one of the most powerful tools driving Bangladesh's transformation. Literacy rates have improved significantly over the years, with increased access to primary and secondary education, especially for girls. Universities and colleges are growing, and the youth are becoming more engaged in technology and entrepreneurship. The government's "Digital Bangladesh" vision aims to make services and opportunities accessible online, promoting innovation, transparency, and efficiency. With a large and youthful population, Bangladesh has the potential to become a major player in the global digital economy. From freelance professionals to tech startups, young Bangladeshis are embracing a future where knowledge, skills, and technology can bridge gaps and unlock new possibilities.",
            "Bangladesh, though often overlooked on the global tourism map, is a country filled with breathtaking landscapes, historical monuments, and cultural treasures. From the serene beaches of Cox's Bazar-the longest natural sea beach in the world-to the mystical hill tracts of Bandarban and the ancient archaeological wonders of Mahasthangarh and Paharpur, the country offers a wide range of attractions for travelers. The Sundarbans, a UNESCO World Heritage Site, is home to diverse wildlife, including the elusive Royal Bengal Tiger. Bangladesh's hospitality and warmth leave lasting impressions on visitors, as does its delicious cuisine, rich in spices and flavors. In recent years, the nation has increased its global visibility by participating in international peacekeeping missions, hosting global summits, and showcasing its talents in sports, especially cricket. These efforts reflect a confident and emerging Bangladesh eager to share its story with the world while preserving its deep-rooted traditions and natural heritage.",
        ],
        "Bangla": [
            "বাংলাদেশের অর্থনীতি প্রধানত কৃষি ও পোশাক শিল্পের উপর নির্ভরশীল। পোশাক খাত রপ্তানি আয়ে গুরুত্বপূর্ণ অবদান রাখে এবং লক্ষ লক্ষ মানুষের কর্মসংস্থান নিশ্চিত করে। সাম্প্রতিক বছরগুলোতে অবকাঠামো ও প্রযুক্তিতে উন্নতির ফলে দেশের অর্থনীতি ধারাবাহিকভাবে বৃদ্ধি পেয়েছে। প্রবাসী কর্মীদের পাঠানো রেমিট্যান্সও জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখে।",
            "বাংলাদেশে কৃষি খাতে ধান, পাট, চা এবং বিভিন্ন ফল ও সবজি উৎপাদিত হয়। কৃষকরা উৎপাদন বাড়াতে ঐতিহ্যবাহী ও আধুনিক পদ্ধতি ব্যবহার করেন। সরকার কৃষকদের ভর্তুকি ও প্রশিক্ষণ দিয়ে সহায়তা করে, যাতে ক্রমবর্ধমান জনসংখ্যার জন্য খাদ্য নিরাপত্তা নিশ্চিত করা যায়।",
            "কৃষি ও পোশাক শিল্প ছাড়াও, বাংলাদেশ তথ্যপ্রযুক্তি ও নবায়নযোগ্য জ্বালানিতে বিনিয়োগ করছে। তথ্যপ্রযুক্তি খাতে তরুণ পেশাজীবীদের জন্য নতুন কর্মসংস্থান সৃষ্টি হচ্ছে, আর সৌরবিদ্যুৎ প্রকল্পের মাধ্যমে গ্রামীণ এলাকায় বিদ্যুৎ পৌঁছে যাচ্ছে। এসব উদ্যোগ অর্থনীতিকে বৈচিত্র্যময় ও টেকসই উন্নয়নের পথে এগিয়ে নিচ্ছে।",
        ]
    }
}

@app.route('/')
def typing_test():
    return render_template('index.html')

@app.route('/get-text', methods=['POST'])
def get_text():
    data = request.json
    topic = data.get('topic', 'random')
    language = data.get('language', 'English')
    
    if topic == 'random':
        # Combine all texts from all topics in selected language
        all_texts = []
        for topic_texts in TEXT_TOPICS.values():
            all_texts.extend(topic_texts.get(language, []))
        selected_text = random.choice(all_texts) if all_texts else "No text available"
    else:
        topic_texts = TEXT_TOPICS.get(topic, {}).get(language, [])
        selected_text = random.choice(topic_texts) if topic_texts else "No text available"
    
    return jsonify({'text': selected_text})

@app.route('/upload-logo', methods=['POST'])
def upload_logo():
    if 'logo' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['logo']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return jsonify({'filename': filename})
    
    return jsonify({'error': 'Upload failed'}), 400

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/save-result', methods=['POST'])
def save_result():
    data = request.json
    print("\n--- Typing Examination Result ---")
    print(f"Institute: {data['institute']}")
    print(f"Examination: {data['exam']}")
    print(f"Examinee: {data['name']} (Roll: {data['roll']})")
    print(f"Date: {datetime.fromisoformat(data['timestamp']).strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"WPM: {data['wpm']}")
    print(f"Accuracy: {data['accuracy']}%")
    print(f"Correct Words: {data['correctWords']}")
    print(f"Incorrect Words: {data['incorrectWords']}")
    print(f"Result: {data['status'].upper()}")
    print(f"Time Taken: {data['timeTaken']} seconds")
    print("--------------------------------\n")
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True)
