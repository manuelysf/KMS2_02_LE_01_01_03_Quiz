document.addEventListener('DOMContentLoaded', () => {
    const auswahlFormular = document.getElementById('auswahl_formular');
    const fragenContainerElement = document.getElementById('fragen_container');
    const antwortKnöpfeElement = document.getElementById('antwort_knöpfe');
    const ergebnisContainerElement = document.getElementById('ergebnis_container');
    const ergebnisElement = document.getElementById('ergebnis');
    const neuStartenKnopf = document.getElementById('neu_starten_knopf');
    const startseiteKnopf = document.getElementById('startseite_knopf');
    const antwortenListeElement = document.getElementById('antworten_liste');

    let gemischteFragen, aktuelleFragenIndex;
    let richtigeAntworten = 0;
    let gesamtFragen = 0;
    let ausgewählteAntworten = [];

    auswahlFormular && auswahlFormular.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const kategorie = document.getElementById('kategorie').value;
        const anzahl = document.getElementById('anzahl').value;
        
        window.location.href = `quiz.html?kategorie=${kategorie}&anzahl=${anzahl}`;
    });

    neuStartenKnopf.addEventListener('click', () => starteQuiz(kategorie, anzahl));
    startseiteKnopf.addEventListener('click', () => window.location.href = 'index.html');

    const urlParams = new URLSearchParams(window.location.search);
    const kategorie = urlParams.get('kategorie');
    const anzahl = urlParams.get('anzahl') || 10; 
    starteQuiz(kategorie, anzahl);

    async function starteQuiz(kategorie, anzahl) {
        const url = `https://opentdb.com/api.php?amount=${anzahl}&difficulty=medium&type=multiple${kategorie ? `&category=${kategorie}` : ''}`;

        const response = await fetch(url);
        const data = await response.json();
        gemischteFragen = data.results.sort(() => Math.random() - 0.5);
        aktuelleFragenIndex = 0;
        richtigeAntworten = 0;
        gesamtFragen = gemischteFragen.length;
        ausgewählteAntworten = [];
        ergebnisContainerElement.classList.add('versteckt');
        fragenContainerElement.classList.remove('versteckt');
        setzeNächsteFrage();
    }

    function setzeNächsteFrage() {
        setzeZustandZurück();
        zeigeFrage(gemischteFragen[aktuelleFragenIndex]);
    }

    function zeigeFrage(frage) {
        const frageElement = document.getElementById('frage');
        frageElement.innerHTML = frage.question;
        const antworten = [...frage.incorrect_answers, frage.correct_answer].sort(() => Math.random() - 0.5);
        antworten.forEach(antwort => {
            const knopf = document.createElement('button');
            knopf.innerText = antwort;
            knopf.classList.add('btn');
            if (antwort === frage.correct_answer) {
                knopf.dataset.correct = true;
            }
            knopf.addEventListener('click', wähleAntwort);
            antwortKnöpfeElement.appendChild(knopf);
        });
    }

    function setzeZustandZurück() {
        while (antwortKnöpfeElement.firstChild) {
            antwortKnöpfeElement.removeChild(antwortKnöpfeElement.firstChild);
        }
    }

    function wähleAntwort(e) {
        const ausgewählterKnopf = e.target;
        const korrekt = ausgewählterKnopf.dataset.correct === 'true';
        ausgewählteAntworten.push({
            frage: gemischteFragen[aktuelleFragenIndex].question,
            ausgewählt: ausgewählterKnopf.innerText,
            korrekt: gemischteFragen[aktuelleFragenIndex].correct_answer,
            istKorrekt: korrekt
        });
        if (korrekt) {
            richtigeAntworten++;
        }
        aktuelleFragenIndex++;
        if (aktuelleFragenIndex < gemischteFragen.length) {
            setzeNächsteFrage();
        } else {
            zeigeErgebnis();
        }
    }

    function zeigeErgebnis() {
        fragenContainerElement.classList.add('versteckt');
        ergebnisContainerElement.classList.remove('versteckt');
        ergebnisElement.innerText = `Du hast ${richtigeAntworten} von ${gesamtFragen} Fragen richtig beantwortet.`;
        zeigeAntworten();
    }

    function zeigeAntworten() {
        antwortenListeElement.innerHTML = '';
        ausgewählteAntworten.forEach(antwort => {
            const antwortDiv = document.createElement('div');
            if (antwort.istKorrekt) {
                antwortDiv.innerHTML = `<strong>Richtig:</strong> ${antwort.frage} <br> <strong>Deine Antwort:</strong> ${antwort.ausgewählt}`;
                antwortDiv.classList.add('richtig');
            } else {
                antwortDiv.innerHTML = `<strong>Falsch:</strong> ${antwort.frage} <br> <strong>Deine Antwort:</strong> ${antwort.ausgewählt} <br> <strong>Richtige Antwort:</strong> ${antwort.korrekt}`;
                antwortDiv.classList.add('falsch');
            }
            antwortenListeElement.appendChild(antwortDiv);
        });
    }
});
