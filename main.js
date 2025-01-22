const fetchData = async () => {
    const response = await fetch('./addresses-us-1000.min.json')
    const data = await response.json()
    return data.addresses
}


const addresses = await fetchData()
const start_btn = document.getElementById('test-start')
const coding_guide = document.querySelector('.coding_guide')
const clock = document.querySelector('.timer')
const questions = document.querySelector('.questions')
const submit = document.querySelector('.submit')
const score = document.querySelector('.score')


let question_answer

const get_random_address = () => {
    return addresses[Math.floor(Math.random() * addresses.length)].address1
}
const extractAddress = (fullAddress) => {
    const parts = fullAddress.split(' ')
    parts.shift()
    return parts.join(' ')
}

const start_timer = (minutes, addresses) => {
    let time = minutes * 60
    let timer = setInterval(() => {
        time -= 1
        clock.textContent = `${Math.floor(time / 60)}:${time % 60 < 10 ? `0${time % 60}` : time % 60}`
        if (time === 0) {
            clock.classList.add('hidden')
            clearInterval(timer)
            coding_guide.classList.add('hidden')
            clock.classList.add('hidden')
            questions.classList.remove('hidden')
            submit.classList.remove('hidden')
            submit.addEventListener('click', on_submit)
            submit.disabled = true
            score.classList.remove('hidden')
            generate_questions(addresses, 10)
        }
}
    , 1000)
}

const generate_addresses = () => {
    let addresses = []
    for (let i = 0; i < 5; i++) {
        let range // 'high' or 'low'
        const address = extractAddress(get_random_address())
        range = Math.random() > 0.5 ? 'high' : 'low'
        if (range === 'low') {
            addresses.push({
                address,
                range,
                low: Math.floor(Math.random() * 1000), // 0 to 1000
                high: Math.floor(Math.random() * 4000 + 1000) // 1000 to 5000
            })
        } else {
            addresses.push({
                address,
                range,
                low: Math.floor(Math.random() * 4000 + 1000), // 1000 to 5000
                high: Math.floor(Math.random() * 15000 + 5000) // 5000 to 15000
            })
        }
    }

    // fill the rest of the list until it has 9 address using addresses already generated but opposite range
    for (let i = 0; i < 4; i++) {
        let address_2 = { ...addresses[i] };
        if (address_2.range === 'low') {
            address_2.range = 'high'
            address_2.low = Math.floor(addresses[i].high + Math.random() * 1000) // 5000 to 6000
            address_2.high = Math.floor(address_2.low + Math.random() * 15000) // 5000 to 20000

        } else {
            address_2.range = 'low'
            address_2.high = Math.floor(addresses[i].low - Math.random() * 1000) // 1000 to 5000 - rand(1000)
            address_2.low = Math.floor(address_2.high * Math.random()) // 1 - 5000
        }
        addresses.push(address_2)
    }

    // shuffle the addresses
    for (let i = addresses.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [addresses[i], addresses[j]] = [addresses[j], addresses[i]];
    }
    
    for (let i = 0; i < addresses.length; i++) {
        if (i < 3) addresses[i].letter = 'A'
        else if (i < 6) addresses[i].letter = 'B'
        else if (i < 9) addresses[i].letter = 'C'
    }
    

    for (let i = 0; i < addresses.length; i++) {
        const ranges = document.getElementById(addresses[i].letter)
        const address = document.createElement('div')
        address.classList.add('address')
        address.textContent = `${addresses[i].low} - ${addresses[i].high} ${addresses[i].address}`
        ranges.appendChild(address)

    }

    return addresses

}

// generate questions with option A, B, C, or D. Each question with random address and house number. 
// Address range is A, B, C, and D is all mail that does not fall in the range of A, B, or C.
const generate_questions = (addresses, number_of_questions) => {
    console.log(addresses)
    let questions = [];
    for (let i = 0; i < number_of_questions; i++) {
        const address = addresses[Math.floor(Math.random() * addresses.length)];
        const house_number = Math.random() > 0.25
            ? Math.floor(Math.random() * (address.high - address.low + 1) + address.low)
            : Math.floor(Math.random() * 20000);
        const answer = between(house_number, address.low, address.high) ? address.letter : 'D';
        const question = {
            address: address.address,
            house_number,
            answer
        };

        questions.push(question);
    }

    for (let i = 0; i < questions.length; i++) {
        const questions_container = document.querySelector('.questions')
        const question_container = document.createElement('div');
        question_container.classList.add('question');

        const question_prompt = document.createElement('div');
        question_prompt.classList.add('question_prompt');
        question_prompt.textContent = `${questions[i].house_number} ${questions[i].address}`
        question_container.appendChild(question_prompt);

        
        const answer_A = document.createElement('div');
        answer_A.id = 'A';
        answer_A.classList.add('answer');
        answer_A.textContent = 'A';
        question_container.appendChild(answer_A);

        const answer_B = document.createElement('div');
        answer_B.id = 'B';
        answer_B.classList.add('answer');
        answer_B.textContent = 'B';
        question_container.appendChild(answer_B);

        const answer_C = document.createElement('div');
        answer_C.id = 'C';
        answer_C.classList.add('answer');
        answer_C.textContent = 'C';
        question_container.appendChild(answer_C);

        const answer_D = document.createElement('div');
        answer_D.id = 'D';
        answer_D.classList.add('answer');
        answer_D.textContent = 'D';
        question_container.appendChild(answer_D);

        let answers = [answer_A, answer_B, answer_C, answer_D];
        for (let j = 0; j < answers.length; j++) {
            answers[j].addEventListener('click', () => {
                for (let k = 0; k < answers.length; k++) {
                    answers[k].classList.remove('selected');
                }
                answers[j].classList.add('selected');
                // disable or enable submit button based on if all answers are selected
                const all_prompt = document.querySelectorAll('.question_prompt')
                console.log(all_prompt.length, document.querySelectorAll('.selected').length)
                if (document.querySelectorAll('.selected').length === all_prompt.length) {
                    submit.disabled = false
                } else {
                    submit.disabled = true
                }
            })
        }

        questions_container.appendChild(question_container);
    }

    question_answer = questions
    console.log(question_answer)
};

const between = (x, min, max) => {
    return x >= min && x <= max;
}


const clear_addresses = () => {
    const ranges = document.querySelectorAll('.guide_range_area')
    for (let i = 0; i < ranges.length; i++) {
        ranges[i].textContent = ''
    }
}

const on_submit = () => {
    start_btn.classList.remove('hidden')
    submit.classList.add('hidden')
    questions.classList.add('hidden')
    let correct = 0
    const answers = document.querySelectorAll('.selected')
    console.log(answers)
    for (let i = 0; i < question_answer.length; i++) {
        if (question_answer[i].answer === answers[i].id) {
            correct += 1
        }
    }
    console.log(`${correct}/${question_answer.length}`)
    score.classList.remove('hidden')
    score.textContent = `SCORE: ${correct}/${question_answer.length}`
}


start_btn.addEventListener('click', () => {
    clear_addresses()
    let exam_time = 0.1
    start_btn.classList.add('hidden')
    coding_guide.classList.remove('hidden')
    clock.classList.remove('hidden')
    clock.textContent = `${exam_time}:00`
    start_timer(exam_time, generate_addresses())

})
