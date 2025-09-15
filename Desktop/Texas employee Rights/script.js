// Texas Employee Rights - Interactive JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    initSmoothScrolling();

    // Add skip link for accessibility
    addSkipLink();

    // Add search functionality
    initSearch();

    // Add table of contents for long sections
    addTableOfContents();

    // Add print functionality
    addPrintButton();

    // Highlight current section in navigation
    initScrollSpy();
});

// Smooth scrolling for navigation
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Add skip link for accessibility
function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';

    document.body.insertBefore(skipLink, document.body.firstChild);
}

// Search functionality
function initSearch() {
    // Create search container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <input type="text" id="search-input" placeholder="Search employee rights topics..." aria-label="Search">
        <button id="search-button" aria-label="Search">Search</button>
        <div id="search-results" class="search-results" style="display: none;"></div>
    `;

    // Insert search after header
    const header = document.querySelector('header');
    header.insertAdjacentElement('afterend', searchContainer);

    // Add search functionality
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResults = document.getElementById('search-results');

    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        const sections = document.querySelectorAll('section');
        const results = [];

        sections.forEach(section => {
            const sectionId = section.id;
            const sectionTitle = section.querySelector('h2')?.textContent || '';
            const sectionContent = section.textContent.toLowerCase();

            if (sectionContent.includes(query)) {
                const matches = [];
                const paragraphs = section.querySelectorAll('p, li');

                paragraphs.forEach(element => {
                    if (element.textContent.toLowerCase().includes(query)) {
                        matches.push(element.textContent.trim());
                    }
                });

                if (matches.length > 0) {
                    results.push({
                        id: sectionId,
                        title: sectionTitle,
                        matches: matches.slice(0, 3) // Limit to 3 matches per section
                    });
                }
            }
        });

        displaySearchResults(results, query);
    }

    searchInput.addEventListener('input', performSearch);
    searchButton.addEventListener('click', performSearch);
}

function displaySearchResults(results, query) {
    const searchResults = document.getElementById('search-results');

    if (results.length === 0) {
        searchResults.innerHTML = '<p>No results found.</p>';
        searchResults.style.display = 'block';
        return;
    }

    let html = '<h3>Search Results</h3>';
    results.forEach(result => {
        html += `
            <div class="search-result-item">
                <h4><a href="#${result.id}">${result.title}</a></h4>
                <ul>
                    ${result.matches.map(match => {
                        const highlightedMatch = match.replace(
                            new RegExp(`(${query})`, 'gi'),
                            '<mark>$1</mark>'
                        );
                        return `<li>${highlightedMatch}</li>`;
                    }).join('')}
                </ul>
            </div>
        `;
    });

    searchResults.innerHTML = html;
    searchResults.style.display = 'block';
}

// Table of contents for long sections
function addTableOfContents() {
    const longSections = document.querySelectorAll('section .container');

    longSections.forEach(container => {
        const headings = container.querySelectorAll('h3, h4');
        if (headings.length > 3) {
            const toc = document.createElement('div');
            toc.className = 'table-of-contents';
            toc.innerHTML = '<h3>Table of Contents</h3><ul></ul>';

            const tocList = toc.querySelector('ul');

            headings.forEach((heading, index) => {
                const id = `section-${container.parentElement.id}-${index}`;
                heading.id = id;

                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `#${id}`;
                a.textContent = heading.textContent;
                a.className = heading.tagName.toLowerCase();

                li.appendChild(a);
                tocList.appendChild(li);
            });

            container.insertBefore(toc, container.firstElementChild.nextSibling);
        }
    });
}

// Print functionality
function addPrintButton() {
    const printButton = document.createElement('button');
    printButton.textContent = '🖨️ Print Guide';
    printButton.className = 'print-button';
    printButton.onclick = () => window.print();

    const header = document.querySelector('.header-content');
    header.appendChild(printButton);
}

// Scroll spy for navigation highlighting
function initScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Add main content ID for skip link
document.addEventListener('DOMContentLoaded', function() {
    const main = document.querySelector('main');
    if (main) {
        main.id = 'main-content';
    }

    // Add emergency contact quick access
    addEmergencyQuickAccess();
});

// Emergency quick access button for urgent situations
function addEmergencyQuickAccess() {
    const emergencyButton = document.createElement('div');
    emergencyButton.className = 'emergency-quick-access';
    emergencyButton.innerHTML = `
        <button class="emergency-pulse-btn" onclick="scrollToTexasHelp()">
            🚨 Emergency Help
        </button>
    `;

    document.body.appendChild(emergencyButton);

    // Add CSS for emergency button
    const emergencyCSS = `
        .emergency-quick-access {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        }

        .emergency-pulse-btn {
            background: linear-gradient(45deg, #f44336, #e53935);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 12px 20px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
            animation: pulse 2s infinite;
            transition: all 0.3s ease;
        }

        .emergency-pulse-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(244, 67, 54, 0.6);
        }

        @keyframes pulse {
            0% { box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4); }
            50% { box-shadow: 0 4px 20px rgba(244, 67, 54, 0.8); }
            100% { box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4); }
        }

        @media (max-width: 768px) {
            .emergency-quick-access {
                bottom: 15px;
                right: 15px;
            }

            .emergency-pulse-btn {
                padding: 10px 16px;
                font-size: 12px;
            }
        }
    `;

    const style = document.createElement('style');
    style.textContent = emergencyCSS;
    document.head.appendChild(style);
}

function scrollToTexasHelp() {
    const texasHelpSection = document.getElementById('texas-help');
    if (texasHelpSection) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = texasHelpSection.offsetTop - headerHeight - 20;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Add CSS for additional elements
const additionalCSS = `
.search-container {
    background: white;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    gap: 1rem;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
}

#search-input {
    flex: 1;
    padding: 0.8rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

#search-button {
    padding: 0.8rem 1.5rem;
    background: #BF0A30;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
}

.search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
}

.search-result-item {
    padding: 1rem;
    border-bottom: 1px solid #eee;
}

.search-result-item:last-child {
    border-bottom: none;
}

.search-result-item h4 {
    margin-bottom: 0.5rem;
}

.search-result-item a {
    color: #002868;
    text-decoration: none;
}

.search-result-item mark {
    background: #fff3cd;
    padding: 0.2rem 0.4rem;
    border-radius: 2px;
}

.table-of-contents {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    margin: 2rem 0;
    border-left: 4px solid #BF0A30;
}

.table-of-contents ul {
    margin: 1rem 0 0 0;
    padding-left: 1rem;
}

.table-of-contents a {
    color: #002868;
    text-decoration: none;
    display: block;
    padding: 0.3rem 0;
}

.table-of-contents a:hover {
    color: #BF0A30;
}

.print-button {
    padding: 0.5rem 1rem;
    background: #002868;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    margin-left: auto;
}

nav a.active {
    background-color: rgba(255,255,255,0.2);
}

@media (max-width: 768px) {
    .search-container {
        flex-direction: column;
        gap: 0.5rem;
    }

    .print-button {
        margin-left: 0;
        margin-top: 1rem;
    }
}
`;

const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);
