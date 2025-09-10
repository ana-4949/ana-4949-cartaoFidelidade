
document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('.card-input');
    const button = document.querySelector('.search-btn');
    const image = document.querySelector('.enter-btn-img');

    setClientSectionsVisible(false);

    const triggerSearch = () => {
        searchByClientId();
    };

    if (button) {
        button.addEventListener('click', triggerSearch);
    }

    if (image) {
        image.addEventListener('click', triggerSearch);
    }

    if (input) {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                triggerSearch();
            }
        });
    }


    const modal = document.getElementById('congratulations-modal');
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeCongratulationsModal();
            }
        });
    }


    const modalBtn = document.querySelector('.modal-btn');
    if (modalBtn) {
        modalBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            closeCongratulationsModal();
        });
    }
});

async function fetchClients() {
    const response = await fetch('./db.json', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('Falha ao carregar db.json');
    }
    const data = await response.json();
    return Array.isArray(data.clients) ? data.clients : [];
}


function showError(message) {
    let errorBox = document.querySelector('.error-box');
    if (!errorBox) {
        errorBox = document.createElement('div');
        errorBox.className = 'error-box';
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.insertAdjacentElement('afterend', errorBox);
        } else {
            document.body.prepend(errorBox);
        }
    }
    errorBox.textContent = message;
    errorBox.style.display = 'block';
}

function clearError() {
    const errorBox = document.querySelector('.error-box');
    if (errorBox) {
        errorBox.style.display = 'none';
        errorBox.textContent = '';
    }
}

function isValidIdFormat(value) {
    return /^\d+$/.test(value);
}

function getOrdinalNumber(num) {
    const ordinals = {
        1: 'primeiro',
        2: 'segundo', 
        3: 'terceiro',
        4: 'quarto',
        5: 'quinto',
        6: 'sexto',
        7: 'sétimo',
        8: 'oitavo',
        9: 'nono',
        10: 'décimo',
        11: 'décimo primeiro',
        12: 'décimo segundo'
    };
    return ordinals[num] || `${num}º`;
}

function checkForCongratulations(client) {
    const totalCuts = client.loyaltyCard?.totalCuts || 0;
    const cutsNeeded = client.loyaltyCard?.cutsNeeded || 10;
    
    if (totalCuts >= cutsNeeded) {
        showCongratulationsModal();
    }
}

function showCongratulationsModal() {
    const modal = document.getElementById('congratulations-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

function closeCongratulationsModal() {
    const modal = document.getElementById('congratulations-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function setClientSectionsVisible(visible) {
    const sections = [
        document.querySelector('.profile-card'),
        document.querySelector('.history-card'),
        document.querySelector('.loyalty-card'),
        document.querySelector('.progress-card')
    ];
    sections.forEach((el) => {
        if (!el) return;
        const isProgress = el.classList.contains('progress-card');
        if (!visible) {
            el.style.display = 'none';
            el.classList.remove('animate-in');
            el.classList.remove('pre-animate');
            return;
        }




        el.classList.remove('animate-in');
        el.classList.add('pre-animate');
        el.style.display = '';
        void el.offsetWidth;


        
        const delay = isProgress ? 150 : 0;
        setTimeout(() => {
            el.classList.remove('pre-animate');
            el.classList.add('animate-in');
        }, delay);
    });
}

function renderProfile(client) {
    const nameEl = document.querySelector('.user-name');
    const sinceEl = document.querySelector('.client-since');
    const imgEl = document.querySelector('.profile-img');

    if (nameEl) {
        nameEl.textContent = client.name
    };
        if (sinceEl) {
            sinceEl.textContent = `Cliente desde ${client.clientSince

            }`;}
    if (imgEl) {
        const fallback = './src/assets/images/avatar.png';
        const userImg = `./src/assets/images/user${client.id}.jpg`;
        imgEl.onerror = () => {
            imgEl.onerror = null;
            imgEl.src = fallback;
        };
        imgEl.src = userImg;
    }
}

function renderHistory(client) {
    const historyList = document.querySelector('.history-list');
    const cutsCountEl = document.querySelector('.cuts-count');
    if (!historyList) return;
    historyList.innerHTML = '';
    const history = Array.isArray(client.appointmentHistory) ? client.appointmentHistory : [];
    if (cutsCountEl) cutsCountEl.textContent = `${history.length} cortes`;

    history.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'history-item';

        const info = document.createElement('div');
        info.className = 'service-info';

        const day = document.createElement('span');
        day.className = 'service-day';
        day.textContent = item.date;

        const time = document.createElement('span');
        time.className = 'service-time';
        time.textContent = item.time;

        info.appendChild(day);
        info.appendChild(time);

        const icon = document.createElement('div');
        icon.className = 'check-icon';
        icon.setAttribute('aria-label', 'Corte Realizado');
        
        

        div.appendChild(info);
        div.appendChild(icon);
        historyList.appendChild(div);
    });
}



function renderLoyaltyCard(client) {
    const stampsGrid = document.querySelector('.stamps-grid');
    const remainingCutsEl = document.querySelector('.remaining-cuts');
    const progressTextEl = document.querySelector('.progress-text');
    const progressFillEl = document.querySelector('.progress-fill');
    const cardIdEl = document.querySelector('.card-id');

    if (!stampsGrid) return;
    stampsGrid.innerHTML = '';

    const totalCuts = client.loyaltyCard?.totalCuts || 0;
    const cutsNeeded = client.loyaltyCard?.cutsNeeded || 10;
    const cutsRemaining = Math.max(cutsNeeded - totalCuts, 0);

    if (cardIdEl) {
        cardIdEl.textContent = `ID: ${client.id}`;
    }

    const loyaltyDescriptionEl = document.querySelector('.loyalty-description');
    if (loyaltyDescriptionEl) {
        const ordinalNumber = getOrdinalNumber(cutsNeeded);
        loyaltyDescriptionEl.textContent = `Ao fazer cortes de cabelo, o ${ordinalNumber} sai de graça!`;
    }

    const totalSlots = cutsNeeded;
    for (let i = 0; i < totalSlots; i++) {
        const cell = document.createElement('div');
        const isCompleted = i < totalCuts;
        cell.className = `stamp ${isCompleted ? 'completed' : (i === totalSlots - 1 ? 'reward' : 'empty')}`;
        if (isCompleted) {
            const img = document.createElement('img');
            img.src = './src/assets/images/PinCheck.png';
            img.alt = 'Feito';
            img.className = 'stamp-icon';
            cell.appendChild(img);
        } else if (i === totalSlots - 1) {
            const img = document.createElement('img');
            img.src = './src/assets/images/icon-gift-solid.svg';
            img.alt = 'presente';
            img.className = 'stamp-icon';
            cell.appendChild(img);
        }
        stampsGrid.appendChild(cell);
    }

    if (remainingCutsEl) {
        const numEl = document.querySelector('.cuts-number');
        if (numEl) numEl.textContent = String(cutsRemaining);
        else remainingCutsEl.textContent = `${cutsRemaining} cortes restantes`;
    }
    if (progressTextEl) progressTextEl.textContent = `${Math.min(totalCuts, cutsNeeded)} de ${cutsNeeded}`;
    if (progressFillEl) {
        const pct = Math.min(totalCuts / cutsNeeded, 1);
        progressFillEl.style.width = `${pct * 100}%`;
        const scale = 0.6 + 0.4 * pct;
        progressFillEl.style.setProperty('--pf-scale', scale.toString());

        progressFillEl.style.background = 'linear-gradient(90deg, var(--color-green) 0%, #52c173 35%, #a356d0 75%, var(--color-pink) 100%)';

        progressFillEl.animate([
            { transform: `scaleY(${Math.max(0.6, scale - 0.1)})` },
            { transform: `scaleY(${scale})` }
        ], { duration: 300, easing: 'ease-out' });
    }
}




async function searchByClientId() {
    const input = document.querySelector('.card-input');
    const rawValue = input ? input.value.trim() : '';
    clearError();
    if (!rawValue) {
        showError('Digite um ID para buscar.');
        setClientSectionsVisible(false);
        return null;
    }

    if (!isValidIdFormat(rawValue)) {
        showError('ID inválido. Use apenas números.');
        setClientSectionsVisible(false);
        return null;
    }

    try {
        const clients = await fetchClients();

        const client = clients.find((c) => String(c.id) === rawValue);

    if (client) {
        console.log('Cliente encontrado:', client);
        renderProfile(client);
        renderHistory(client);
        renderLoyaltyCard(client);
        setClientSectionsVisible(true);
        checkForCongratulations(client);
        
        return client;
    } else {
            showError('Cliente não encontrado.');
            setClientSectionsVisible(false);
            return null;
        }
    } catch (error) {
        console.error(error);
        showError('Erro ao buscar dados. Use um servidor local (http).');
        setClientSectionsVisible(false);
        return null;
    }
}
