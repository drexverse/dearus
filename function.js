const revealButton = document.querySelector('#revealButton');
const loveNote = document.querySelector('#loveNote');

if (revealButton && loveNote) {
	revealButton.addEventListener('click', () => {
		const isOpen = revealButton.getAttribute('aria-expanded') === 'true';
		revealButton.setAttribute('aria-expanded', String(!isOpen));
		loveNote.hidden = isOpen;
		revealButton.querySelector('span:nth-child(2)').textContent = isOpen ? 'Open my heart' : 'Close my heart';
		revealButton.querySelector('.button-heart').textContent = isOpen ? '♡' : '♥';
	});
}

const daysCounter = document.querySelector('#daysCounter');

if (daysCounter) {
	const startDate = new Date(2026, 1, 15);
	const dayInMilliseconds = 24 * 60 * 60 * 1000;

	const updateDaysCounter = () => {
		const now = new Date();
		const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		if (currentDate < startDate) {
			daysCounter.textContent = '0 Months 0 Days';
			return;
		}

		let months = (currentDate.getFullYear() - startDate.getFullYear()) * 12;
		months += currentDate.getMonth() - startDate.getMonth();

		let anniversary = new Date(startDate.getFullYear(), startDate.getMonth() + months, startDate.getDate());
		if (currentDate < anniversary) {
			months -= 1;
			anniversary = new Date(startDate.getFullYear(), startDate.getMonth() + months, startDate.getDate());
		}

		const days = Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(anniversary.getFullYear(), anniversary.getMonth(), anniversary.getDate())) / dayInMilliseconds);
		daysCounter.textContent = `${months} Months ${days} Days`;
	};

	updateDaysCounter();
	setInterval(updateDaysCounter, 60 * 1000);
}

const openWhenCards = document.querySelectorAll('.open-when-card');
const openWhenSection = document.querySelector('.open-when-section');

if (openWhenCards.length && openWhenSection) {
	const openingTimers = new WeakMap();
	const focusTimers = new WeakMap();
	const closingTimers = new WeakMap();

	const clearCardTimers = (card) => {
		window.clearTimeout(openingTimers.get(card));
		window.clearTimeout(focusTimers.get(card));
		window.clearTimeout(closingTimers.get(card));
	};

	const closeOpenWhenCard = (card, restoreFocus = false) => {
		const trigger = card.querySelector('.open-when-trigger');
		const letter = card.querySelector('.open-when-letter');
		card.classList.remove('is-revealed');
		card.classList.add('is-closing');
		trigger.setAttribute('aria-expanded', 'false');
		clearCardTimers(card);
		const closingTimer = window.setTimeout(() => {
			card.classList.remove('is-focused', 'is-closing');
			openWhenSection.classList.remove('has-open');
			document.body.classList.remove('open-when-modal-open');
			letter.hidden = true;
			if (restoreFocus) trigger.focus();
		}, 550);
		closingTimers.set(card, closingTimer);
	};

	const resetOpenWhenCard = (card) => {
		clearCardTimers(card);
		card.classList.remove('is-focused', 'is-closing', 'is-revealed');
		card.querySelector('.open-when-trigger').setAttribute('aria-expanded', 'false');
		card.querySelector('.open-when-letter').hidden = true;
	};

	openWhenCards.forEach((card) => {
		const trigger = card.querySelector('.open-when-trigger');
		const letter = card.querySelector('.open-when-letter');
		const closeButton = card.querySelector('.open-when-close');

		trigger.addEventListener('click', () => {
			const isOpen = card.classList.contains('is-focused');
			if (isOpen) {
				closeOpenWhenCard(card);
				return;
			}

			const originalBounds = card.getBoundingClientRect();
			card.style.setProperty('--return-x', `${originalBounds.left + originalBounds.width / 2 - window.innerWidth / 2}px`);
			card.style.setProperty('--return-y', `${originalBounds.top + originalBounds.height / 2 - window.innerHeight / 2}px`);
			openWhenCards.forEach((otherCard) => {
				if (otherCard !== card && otherCard.classList.contains('is-focused')) resetOpenWhenCard(otherCard);
			});
			clearCardTimers(card);
			openWhenSection.classList.add('has-open');
			document.body.classList.add('open-when-modal-open');
			card.classList.remove('is-closing');
			card.classList.add('is-focused');
			trigger.setAttribute('aria-expanded', 'true');
			const openingTimer = window.setTimeout(() => {
				if (!card.classList.contains('is-focused')) return;
				letter.hidden = false;
				card.classList.add('is-revealed');
				const focusTimer = window.setTimeout(() => closeButton.focus(), 500);
				focusTimers.set(card, focusTimer);
			}, 650);
			openingTimers.set(card, openingTimer);
		});

		closeButton.addEventListener('click', () => closeOpenWhenCard(card, true));
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			openWhenCards.forEach((card) => {
				if (card.classList.contains('is-focused')) closeOpenWhenCard(card, true);
			});
		}
	});

	document.addEventListener('click', (event) => {
		if (openWhenSection.classList.contains('has-open') && !event.target.closest('.open-when-card.is-focused')) {
			openWhenCards.forEach((card) => {
				if (card.classList.contains('is-focused')) closeOpenWhenCard(card, true);
			});
		}
	});
}

const SUPABASE_URL = 'https://crxjcuvraoysexavfuia.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_mcwde8888OJJFENeV1WK1w_p6qfAL2F';
const supabaseClient = window.supabase
	? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
	: null;
const messageAppsScriptEndpoint = 'https://script.google.com/macros/s/AKfycbyjV1ACtFrYadkM0snrS83eaGN0PMt0dhmtOwW7Swkx25UdiDhevBXAz5JZWTLWSLregQ/exec';

const promiseForm = document.querySelector('#promiseForm');
const promiseText = document.querySelector('#promiseText');
const promiseAnswer = document.querySelector('#promiseAnswer');
const promiseList = document.querySelector('#promiseList');	
const promiseCount = document.querySelector('#promiseCount');
const promiseStatus = document.querySelector('#promiseStatus');
const savedPromiseKey = 'forYouAlwaysPromises';

const allowedPromiseNames = [
	'shane&diyana',
	'shaneanddiyana',
	'shane and diyana',
	'diyana and shane'
];

if (promiseForm && promiseText && promiseAnswer && promiseList && promiseCount && promiseStatus) {
	const getSavedPromises = () => {
		try {
			return JSON.parse(localStorage.getItem(savedPromiseKey) || '[]');
		} catch (error) {
			return [];
		}
	};

	const savePromises = (promises) => {
		localStorage.setItem(savedPromiseKey, JSON.stringify(promises));
	};

	const createPromiseCard = (promise, promiseIndex) => {
		const card = document.createElement('article');
		const number = document.createElement('span');
		const quote = document.createElement('blockquote');
		const footer = document.createElement('footer');

		card.className = 'promise-card promise-card-user';
		card.dataset.promiseId = promise.id;
		number.className = 'promise-card-number';
		number.textContent = String(promiseIndex).padStart(2, '0');
		quote.textContent = `“${promise.text}”`;
		footer.textContent = promise.date;
		card.append(number, quote, footer);

		return card;
	};


	const showPromises = (promises) => {
		promiseList.querySelectorAll('.promise-card-user').forEach((card) => card.remove());
		promises.forEach((promise, index) => promiseList.append(createPromiseCard(promise, index + 3)));
	};

	const loadPromises = async () => {
		try {
			if (!supabaseClient) throw new Error('Supabase client unavailable');
			const { data: promiseRows, error } = await supabaseClient
				.from('promises')
				.select('id,promise_text,created_at')
				.order('created_at', { ascending: true });
			if (error) throw error;
			const normalizedPromises = promiseRows.map((promise) => ({
				id: promise.id,
				text: promise.promise_text,
				date: new Date(promise.created_at).toLocaleString()
			}));
			showPromises(normalizedPromises);
			localStorage.setItem(savedPromiseKey, JSON.stringify(normalizedPromises));
		} catch (error) {
			showPromises(getSavedPromises());
		}
	};

	promiseText.addEventListener('input', () => {
		promiseCount.textContent = `${promiseText.value.length} / 240`;
	});

	loadPromises();

	promiseForm.addEventListener('submit', async (event) => {
		event.preventDefault();
		const answer = promiseAnswer.value.trim();
		const newPromiseText = promiseText.value.trim();

		if (!allowedPromiseNames.includes(answer.toLowerCase())) {
			window.alert('You are not chosen.');
			promiseStatus.textContent = 'You are not chosen.';
			return;
		}

		if (!newPromiseText) {
			promiseStatus.textContent = 'Write a little promise first.';
			return;
		}

		const newPromise = {
			id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
			text: newPromiseText,
			date: 'sealed just now'
		};
		const submitButton = promiseForm.querySelector('button[type="submit"]');
		submitButton.disabled = true;
		promiseStatus.textContent = 'Saving your promise...';

		try {
			if (!supabaseClient) throw new Error('Supabase client unavailable');
			const { data: savedPromise, error } = await supabaseClient
				.from('promises')
				.insert({ promise_text: newPromise.text, chosen_name: answer })
				.select('id,promise_text,created_at')
				.single();
			if (error) throw error;
			const savedPromises = [...getSavedPromises(), {
				id: savedPromise.id,
				text: savedPromise.promise_text,
				date: new Date(savedPromise.created_at).toLocaleString()
			}];
			savePromises(savedPromises);
			showPromises(savedPromises);
			promiseForm.reset();
			promiseCount.textContent = '0 / 240';
			promiseStatus.textContent = 'Saved to Supabase and this browser. ♡';
		} catch (error) {
			window.alert('Your promise could not be saved to Supabase.');
			promiseStatus.textContent = 'Your promise was not saved.';
		} finally {
			submitButton.disabled = false;
		}
	});

}

const messageForm = document.querySelector('#messageForm');
const messageResponse = document.querySelector('#messageResponse');

if (messageForm && messageResponse) {
	messageForm.addEventListener('submit', async (event) => {
		event.preventDefault();

		const submitButton = messageForm.querySelector('button[type="submit"]');
		const formData = new FormData(messageForm);
		const message = {
			name: String(formData.get('name') || '').trim(),
			email: String(formData.get('email') || '').trim(),
			message: String(formData.get('message') || '').trim()
		};

		submitButton.disabled = true;
		messageResponse.textContent = 'Sending your message...';

		try {
			await fetch(messageAppsScriptEndpoint, {
				method: 'POST',
				mode: 'no-cors',
				headers: { 'Content-Type': 'text/plain;charset=utf-8' },
				body: JSON.stringify(message)
			});
			messageResponse.textContent = `Thank you, ${message.name}. Your message has been saved to our little corner. ♡`;
			messageForm.reset();
		} catch (error) {
			messageResponse.textContent = 'We could not save your message right now. Please try again.';
		} finally {
			submitButton.disabled = false;
		}
	});
}

