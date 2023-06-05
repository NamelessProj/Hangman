const formatterCompact = Intl.NumberFormat('en', {
    notation: 'compact'
});
const formatterStandard = Intl.NumberFormat('en', {
    notation: 'standard'
});

const totalWord = DICTIONARY_ENG.length;

const inputBtns = document.querySelectorAll('.input-btn');
const wordSeekSection = document.querySelector('.word-seek');

const remainingLiveEl = document.querySelector('.current-live');
const totalLiveEl = document.querySelector('.total-live');

const dialogHangman = document.querySelector('[data-hangman-dialog]');

const btnShakeAnimation = [
    { transform: "rotate(0);" },
    { transform: "rotate(15deg);" },
    { transform: "rotate(0);" },
    { transform: "rotate(-15deg)" },
    { transform: "rotate(0)" },
    { transform: "rotate(15deg);" },
    { transform: "rotate(0);" },
    { transform: "rotate(-15deg)" },
    { transform: "rotate(0)" },
    { transform: "rotate(15deg);" },
    { transform: "rotate(0);" },
    { transform: "rotate(-15deg)" },
    { transform: "rotate(0)" },
];
const btnShakeTiming = {
    duration: 300,
    iteration: 1,
};

var existingHangmanScore = JSON.parse(localStorage.getItem('hangmanScore')) || 0;
var existingHangmanMaxScore = JSON.parse(localStorage.getItem('hangmanMaxScore')) || 0;

document.querySelector('.consecutive').innerText = existingHangmanScore;

document.querySelector('.max-consecutive').innerText = existingHangmanMaxScore;

class Hangman {
    constructor(){
        this.newWord = '';
        this.live = 9;
        this.correctLetter = 0;
        this.wordLength = 0;
        this.totalDialog = 0;
        this.closeIcon = `<svg xmlns="https://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`;
    }

    toNormalForm(str){
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    generate_word(retry = false){
        var newWord = this.toNormalForm(DICTIONARY_ENG[Math.floor(Math.random()*DICTIONARY_ENG.length)].toUpperCase());

        wordSeekSection.innerHTML = '';

        this.newWord = newWord;
        this.live = 9; // reset the live
        this.correctLetter = 0;

        totalLiveEl.innerText = remainingLiveEl.innerText = this.live;

        for(let i = 0; i < newWord.length; i++){
            if(/^[a-zA-Z]/.test(newWord[i])){
                wordSeekSection.innerHTML += '<div class="word-seek-letter" data-letter-box="'+i+'"></div>';
                this.wordLength++;
            }else if(newWord[i] == '-'){
                wordSeekSection.innerHTML += '<div class="word-seek-letter hyphen">-</div>';
            }else{
                wordSeekSection.innerHTML += '<div class="word-seek-letter space"></div>';
            }
        }
        
        if(retry){
            document.querySelectorAll('[data-letter].clicked').forEach(el => {
                el.classList.remove('clicked');
            });
        }
    }

    again(){
        var btn = `<button type="button" onclick="location.reload();">Let's continue</button>`;
        document.querySelector('.options').innerHTML += btn;
    }

    check_letter(e, btnLetter=false, place){
        var letter;
        place++;

        if(btnLetter && place){
            var placeBtn = document.querySelector('[data-letter]:nth-child('+place+')');
            if(placeBtn.classList.contains('clicked')){
                placeBtn.animate(btnShakeAnimation, btnShakeTiming);
                return;
            };
            letter = btnLetter;
            placeBtn.classList.add('clicked');
        }else if(e){
            if(e.classList.contains('clicked')){
                e.animate(btnShakeAnimation, btnShakeTiming);
                return;
            };
            letter = e.innerText.toUpperCase();
            e.classList.add('clicked');
        }else{return;}

        if(this.newWord.includes(letter)){
            for(let i = 0; i < this.newWord.length; i++){
                if(this.newWord[i] == letter){
                    this.correctLetter++;
                    document.querySelector('[data-letter-box="'+i+'"]').innerText = letter;
                }
            }

            if(this.wordLength == this.correctLetter){
                existingHangmanScore+=1;
                document.querySelector('.consecutive').innerText = existingHangmanScore;
                if(existingHangmanScore >= existingHangmanMaxScore){
                    existingHangmanMaxScore = existingHangmanScore;
                    document.querySelector('.max-consecutive').innerText = existingHangmanMaxScore;
                    localStorage.setItem('hangmanMaxScore', JSON.stringify(existingHangmanMaxScore));
                }

                localStorage.setItem('hangmanScore', JSON.stringify(existingHangmanScore));

                this.dialog('Congratulation !', 'You have successfully guess the word:'); //we won
            }
        }else{
            this.reduce_life();
        }
    }

    reduce_life(){
        this.live--;

        remainingLiveEl.innerText = this.live;

        if(this.live <= 0){
            existingHangmanScore = 0;
            document.querySelector('.consecutive').innerText = existingHangmanScore;
            localStorage.setItem('hangmanScore', JSON.stringify(existingHangmanScore));
            this.dialog('You lose !', 'You haven\'t guess the word:'); // we lose
        }
    }

    dialog(title, text){
        dialogHangman.showModal();

        document.querySelector('[data-hangman-dialog] .dialog h2').innerText = title;
        document.querySelector('[data-hangman-dialog] .dialog div').innerText = text;
        document.querySelector('[data-hangman-dialog] .dialog h3').innerText = this.newWord;

        this.again();
    }

    close_dialog(id){
        document.querySelector('[data-hangman-dialog="'+id+'"]').style.display = 'none';
    }
}

const hangman = new Hangman;


hangman.generate_word();


inputBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        hangman.check_letter(btn);
    });
});

document.querySelector('button.close-dialog').addEventListener('click', () => {
    dialogHangman.close();
});

document.querySelector('.retry-btn').addEventListener('click', () => {
    hangman.generate_word(true);
});

document.querySelector('.total-words-num').innerText = formatterCompact.format(totalWord);
document.querySelector('.total-words-num').title = formatterStandard.format(totalWord);



const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
document.onkeydown = function(e) {
    var letter = e.key.toUpperCase();
    if(alphabet.includes(letter)){
        var place = alphabet.indexOf(letter);
        hangman.check_letter(false, letter, place);
    }
};
