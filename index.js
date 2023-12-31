// import * as transformers from './client/@xenova/transformers'
import * as transformers from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.12.0'
import stopwords from './model/stopwords/stopwords.js'

// define path of model and vocabs
const modelPath = 'https://raw.githubusercontent.com/adhsen456/system-web/main/model/model_json/model.json'
const vocabPath = 'https://raw.githubusercontent.com/adhsen456/system-web/main/model/tokenizer/tokenizer_dict.json'
const indobertVocabPath = 'https://raw.githubusercontent.com/adhsen456/system-web/main/model/tokenizer/indobert_dict.json' 

console.log(transformers.AlbertModel);
const loadModel = async() => {
    tf.serialization.registerClass(transformers.AlbertModel, null, 'TFAlbertModel')
    return await tf.loadLayersModel(modelPath)
}

const removeStopwords = (tokens, stopwords) => {
    return tokens.filter(function (value) {
      return stopwords.indexOf(value.toLowerCase()) === -1
    })
}

const preprocessText = (text) => {
    // lowercase input
    text = text.toLowerCase()
    // remove urls
    text = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g,  '')
    // remove punctuations
    text = text.replace(/[^\w\s]|_/g,'')
    // #remove digit from string
    text = text.replace(/[0-9]/g,'')
    // Remove additional white spaces
    text = text.replace(/\s/g, ' ')
    // remove stopwords
    const words = text.split(' ')
    text = removeStopwords(words, stopwords).join(' ')
    return text
}

const loadTokenizer = async() => {
    const tokenizers = await fetch(vocabPath)
    const tokenizersData = await tokenizers.json()
    return tokenizersData
}

const loadIndobertTokenizer = async() => {
    const indobertTokenizer = await fetch(indobertVocabPath)
    const indobertTokenizerData = await indobertTokenizer.json()
    return indobertTokenizerData
}

const tokenize = async (text) => {
    const tokenizer = await loadTokenizer()
    const split_text = text.split(' ');
    const tokens = [];
    split_text.forEach(element => {
        if (tokenizer[element] != undefined) {
            tokens.push(tokenizer[element]);
        }
    });

    const paddedToken = tokens;
    while (paddedToken.length < 200) {
        paddedToken.push(0);
    }
    return paddedToken
}

const indobertTokenize = async (text) => {
    const tokenizer = await loadIndobertTokenizer()
    const splitText = text.split(' ');
    // add special tokens
    splitText.unshift('[CLS]')
    splitText.push('[SEP]')

    const tokens = [];
    splitText.forEach(element => {
        if (tokenizer[element] != undefined) {
            tokens.push(tokenizer[element]);
        }
    });
    //get padded token and attention mask
    const paddedToken = tokens;
    while (paddedToken.length < 200) {
        paddedToken.push(0);
    }
    const attentionMask = []
    paddedToken.forEach(tokenId => {
        tokenId === 0 ? attentionMask.push(0) : attentionMask.push(1)
    })
    return {'tokenId': paddedToken, 'attentionMask': attentionMask }
}


const testStr = 'Sementara itu, di Arab Saudi Salju turun untuk pertama kali dalam 100 tahun . Penjelasan:Akun Twitter @Strawberygirli mengunggah video yang memperlihatkan dua ekor unta di gurun yang tengah ditutupi salju. Pengguna Twitter tersebut juga menulis klaim bahwa video yang diunggah pada 25 Februari 2023 tersebut terjadi di Arab Saudi dan merupakan fenomena salju yang turun pertama kali dalam 100 tahun terakhir. Setelah dilakukan penelusuran dengan Yandex Video Search, video tersebut telah banyak beredar sejak 2021, salah satunya diunggah oleh pengguna YouTube bernama pada 19 Februari 2021. Pengguna YouTube tersebut mengunggah video serupa dengan judul Wonder of nature in the desert 2021! Snowfall in Saudi Arabia Testament and predictions of Isaiah . Selain itu, dilansir dari laman berita Mirror, turunnya salju pertama kali dalam 100 tahun di Arab Saudi terjadi pada Desember 2013. Artikel berita tersebut berjudul Video: Watch Saudi Arabian man s hilarious snow fail as he jumps into country s first snow in 100 years . Dengan demikian, informasi yang disebarluaskan oleh @Strawberygirli merupakan konten yang menyesatkan. Referensi:https://www.youtube.com/watch?v de5jM9-7raM https://www.mirror.co.uk/news/weird-news/saudi-arabia-snow-video-watch-2932938'
const cleaned = preprocessText(testStr)
console.log('kal');
// console.log(tokenizer);
console.log(preprocessText(testStr));
console.log(tokenize(cleaned));
console.log(indobertTokenize(cleaned));
console.log(loadModel());

const predictHoax = async () => {
    const modell = await loadModel()
    // console.log(modell);
    // modell ? console.log('yes') : console.log('no') 
    const token = await tokenize(cleaned)
    const indobertToken = await indobertTokenize(cleaned)
    const prob = modell.predict({'inputIds': indobertToken.tokenId, 'inputMask': indobertToken.attentionMask, 'inputText': token}).data()
    // const prob = tf.tidy(() => {
    //     speechText = document.getElementById('userInput').value;        
    //     var x = tokenize(speechText)
    //     x = model.predict(tf.tensor2d(x, [x.length, 100]));
    //     x = tf.mean(x);
    //     x = x.arraySync();
    //     return x
    // })
    // console.log(prob);
    // if (prob < 0.5) {
    //     return `<p style="color:rgb(255,100,100); font-size:150%;">We predict this is by a member of the <b>LABOUR</b> party, with probability ${(100 - prob*100).toFixed(0)}%</p>`;
    // } else {
    //     return `<p style="color:rgb(100,100,255); font-size:150%;">We predict this is by a member of the <b>CONSERVATIVE</b> party, with probability ${(prob*100).toFixed(0)}%</p>`;
    // }    
    return prob
}

console.log(predictHoax())

    // const predicting = async (input) => {
    //     const model = await loadModel()
    //     // console.log(model.predict(input));
    //     let prediction = await model.predict(input).data()
    //     // console.log(prediction);
    //     let top = Array.from(prediction)
    //     .map((p, i) => {
    //         return {
    //             probability: parseFloat(p),
    //             className: label[i]
    //         }
    //     }).sort(function(a,b){
    //         return b.probability - a.probability;
    //     }).slice(0,1);
    //     console.log(top);
    //     return top
    // }
    
    // const submitData = async () => {
    //     const inputName = document.querySelector('#name').value
    //     const inputAge = document.querySelector('#age').value
    //     const inputGender = document.querySelector('#gender').value
    //     const inputImage = document.querySelector('#image').value[0]
    //     const errorMessage = document.getElementsByClassName('error')
    //     const loading = document.querySelector('.loader')
    //     const result = document.querySelector('.result')
        
        
    //     if(result.innerHTML === ``) {loading.style.display = 'block'}

    //     if(!inputName || !inputAge || !inputImage){
    //         if(!inputName) {errorMessage[0].style.display = 'block'}
    //         if(!inputAge) {errorMessage[1].style.display = 'block'}
    //         if(!inputImage) {errorMessage[2].style.display = 'block'}
    //     }
    //     else if(inputName && inputAge && inputImage && inputGender){
    //         const preprocessed = await preprocessImage(file)
    //         const predicted = await predicting(preprocessed)
    //         // console.log(preprocessed);
    //         console.log(predicted)
    //         result.innerHTML = `
    //         <h4>Nama          : ${inputName}</h4>
    //         <h4>Umur          : ${inputAge}</h4>
    //         <h4>Jenis Kelamin : ${inputGender}</h4>
    //         <h4>Hasil Scan    : </h4>
    //         <img src="${file.src}" width="150px" alt="">
    //         <p style="margin-top: 10px">${predicted[0].className == "Bukan Kanker" ? "Selamat, hasil tersebut tidak terindikasi adanya sel kanker" : "Anda terindikasi terkena kanker, silakan konsultasikan ke dokter untuk pencegahan"}</p>
    //         `
    //         loading.style.display = 'none'
    //     }
    // }

    // const resetData = () => {
    //     const result = document.querySelector('.result')
    //     file.src = ''
    //     // file.setAttribute('hidden')
    //     result.innerHTML = ``
    // }

    // const previewFile = () => {
    //     const preview = document.querySelector('.preview');
    //     const file = document.querySelector('input[type=file]').files[0];
    //     const reader = new FileReader();
      
    //     reader.addEventListener("load", () => {
    //       // convert image file to base64 string
    //       preview.removeAttribute('hidden')
    //       preview.src = reader.result;
    //     }, false);
      
    //     if (file) {
    //       reader.readAsDataURL(file);
    //     }
    //   }
      
    // fileUpload.addEventListener('change', previewFile)
    // submitButton.addEventListener('click', submitData)
    // resetButton.addEventListener('click', resetData)

    async function init() {
        // sampleSelction = document.getElementById('samples');
    
        // predictOutput = document.getElementById('result');
        
        // theButton = document.getElementById("predict-btn");
    
        // theButton.innerHTML = `Loading...`;
    
        loadTokenizer();
        // console.log(loadBertTokenizer());
    
        // theButton.innerHTML = `Loading......`;
    
        // model = await loadModel();
    
        // theButton.disabled = false;
        // theButton.addEventListener("click", predictSpeech);   
        
        // theButton.innerHTML = `Predict! (This may take a moment...)`;    
    }
    
    init();