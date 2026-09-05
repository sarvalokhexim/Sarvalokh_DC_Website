/* ==========================================================================
   Firebase Configuration & Initialization
   ========================================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyCSzBZj5jbqaDQVAMn_um4oCwWqpQQbs28",
  authDomain: "sarvalokhdcwebsite.firebaseapp.com",
  projectId: "sarvalokhdcwebsite",
  storageBucket: "sarvalokhdcwebsite.firebasestorage.app",
  messagingSenderId: "86411889019",
  appId: "1:86411889019:web:73a816dac3f2c5d79fd5de",
  measurementId: "G-3DM791N10T"
};

let db = null;
if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("Firebase Firestore connected successfully.");
    } catch (err) {
        console.error("Firebase init error:", err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileNav();
    initYieldCalculator();
    initLogisticsPlanner();
    initMapVisualizer();
    initQuoteForm();
});

/* ---------------------------------------------------------
   1. Header Scroll State
   --------------------------------------------------------- */
function initHeader() {
    const header = document.querySelector('.main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Active Nav Link highlight on Scroll
        highlightNavLink();
    });
}

function highlightNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentId = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentId = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
            link.classList.add('active');
        }
    });
}

/* ---------------------------------------------------------
   2. Mobile Hamburger Navigation
   --------------------------------------------------------- */
function initMobileNav() {
    const toggle = document.getElementById('mobileToggle');
    const menu = document.getElementById('navMenu');
    
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('open');
            const isOpen = menu.classList.contains('open');
            toggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
        });

        // Close menu when link is clicked
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('open');
                toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            });
        });
    }
}

/* ---------------------------------------------------------
   3. Products Modal Handler
   --------------------------------------------------------- */
const productSpecs = {
    fine: {
        title: "Fine Grade Desiccated Coconut",
        image: "/static/images/grade_fine.png",
        icon: "fa-solid fa-snowflake",
        desc: "Delicately ground and grated coconut of premium quality, free-flowing, and pure white in appearance. Sourced from the finest local mills and dried under hygienic conditions to preserve natural flavor and oil consistency.",
        specs: [
            "<strong>Moisture:</strong> Max 3.0%",
            "<strong>Fat Content:</strong> 65% ± 3% (on dry basis)",
            "<strong>Free Fatty Acids:</strong> Max 0.10% (as Lauric Acid)",
            "<strong>SO2 Content:</strong> Free (or Max 50ppm as per buyer country limits)",
            "<strong>E. coli & Salmonella:</strong> Absent in 25g",
            "<strong>Sieve Analysis:</strong> 90% passes 1.4mm aperture mesh"
        ],
        apps: "Confectionery fillings, biscuits & cookies manufacturing, cakes, pastries, retail baking packets, and chocolate coatings."
    },
    medium: {
        title: "Medium Grade Desiccated Coconut",
        image: "/static/images/grade_medium.png",
        icon: "fa-solid fa-border-all",
        desc: "Milled to yield a slightly larger particle size compared to Fine. Provides a distinct textured mouthfeel and pleasant coconut aroma, making it excellent for baked products requiring structural chewiness.",
        specs: [
            "<strong>Moisture:</strong> Max 3.5%",
            "<strong>Fat Content:</strong> 65% ± 3% (on dry basis)",
            "<strong>Free Fatty Acids:</strong> Max 0.12% (as Lauric Acid)",
            "<strong>SO2 Content:</strong> Free (or Max 50ppm)",
            "<strong>E. coli & Salmonella:</strong> Absent in 25g",
            "<strong>Sieve Analysis:</strong> 90% passes 2.8mm aperture mesh"
        ],
        apps: "Cakes, donuts, granola, muesli blocks, health food bars, and traditional Indian sweet preparations."
    },
    powder: {
        title: "Extra Fine / Powder Grade",
        image: "/static/images/grade_powder.png",
        icon: "fa-solid fa-wind",
        desc: "Finely pulverized desiccated coconut. Perfect for recipes where visual presence of coconut flakes is not desired, but the natural aromatic fats and rich creamy profile are required.",
        specs: [
            "<strong>Moisture:</strong> Max 3.0%",
            "<strong>Fat Content:</strong> 64% ± 3%",
            "<strong>Free Fatty Acids:</strong> Max 0.10%",
            "<strong>SO2 Content:</strong> Free / Max 50ppm",
            "<strong>E. coli & Salmonella:</strong> Absent in 25g"
        ],
        apps: "Dry mixes, instant beverage formulations, chocolate fill bars, ice cream flavoring powders, and cosmetics applications."
    },
    flakes: {
        title: "Coconut Flakes Grade",
        image: "/static/images/grade_flakes.png",
        icon: "fa-solid fa-leaf",
        desc: "Thinly sliced, shaved coconut chips. Offers a premium visual appearance and crunchy texture when toasted. Highly prized by boutique bakeries and healthy snack manufacturers.",
        specs: [
            "<strong>Moisture:</strong> Max 4.0%",
            "<strong>Fat Content:</strong> 63% ± 3%",
            "<strong>Free Fatty Acids:</strong> Max 0.12%",
            "<strong>SO2 Content:</strong> Free / Max 50ppm",
            "<strong>Thickness:</strong> 0.5mm - 1.2mm",
            "<strong>Aflatoxins:</strong> Negative"
        ],
        apps: "Toppings for organic cereals, acai bowls, energy bar coatings, premium confectionery decoration, and healthy retail trail mixes."
    },
    shreds: {
        title: "Coconut Shreds Grade",
        image: "/static/images/grade_shreds.png",
        icon: "fa-solid fa-lines-leaning",
        desc: "Long, narrow strips of shredded coconut. Excellent structural integrity and rich natural flavor, providing a visually appealing rustic finish to upscale industrial desserts.",
        specs: [
            "<strong>Moisture:</strong> Max 4.0%",
            "<strong>Fat Content:</strong> 65% ± 3%",
            "<strong>Free Fatty Acids:</strong> Max 0.12%",
            "<strong>SO2 Content:</strong> Free / Max 50ppm",
            "<strong>Length:</strong> 5mm - 15mm"
        ],
        apps: "Industrial cakes decoration, artisanal macaroons, ice cream coatings, and specialized baking products."
    },
    reduced_fat: {
        title: "Reduced Fat Desiccated Coconut",
        image: "/static/images/grade_reduced_fat.png",
        icon: "fa-solid fa-heart",
        desc: "Partially defatted coconut meal obtained by expressing a portion of natural coconut oil. High in dietary fiber and protein, serving as a low-calorie alternative while retaining authentic aroma.",
        specs: [
            "<strong>Moisture:</strong> Max 4.5%",
            "<strong>Fat Content:</strong> 45% - 50% (Low oil content)",
            "<strong>Free Fatty Acids:</strong> Max 0.15%",
            "<strong>Protein Content:</strong> 10% - 12% (on dry basis)",
            "<strong>SO2 Content:</strong> Free / Max 50ppm"
        ],
        apps: "Dietetic foods, protein supplement bars, high-fiber health biscuits, vegan snack alternatives, and sports nutrition foods."
    }
};

let currentModalSelection = "";

function openProductModal(grade) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('modalTitle');
    const icon = document.getElementById('modalIcon');
    const desc = document.getElementById('modalDesc');
    const specsList = document.getElementById('modalSpecs');
    const apps = document.getElementById('modalApps');
    const sampleImg = document.getElementById('modalSampleImg');
    
    const data = productSpecs[grade];
    if (data && modal) {
        currentModalSelection = grade;
        title.textContent = data.title;
        icon.innerHTML = `<i class="${data.icon}"></i>`;
        desc.textContent = data.desc;
        apps.textContent = data.apps;
        
        if (sampleImg && data.image) {
            sampleImg.src = data.image;
            sampleImg.alt = data.title + " Sample";
        }
        
        specsList.innerHTML = '';
        data.specs.forEach(spec => {
            const li = document.createElement('li');
            li.innerHTML = spec;
            specsList.appendChild(li);
        });
        
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = 'auto'; // Unlock scroll
    }
}

// Window click event to close modal if backdrop is clicked
window.addEventListener('click', (e) => {
    const modal = document.getElementById('productModal');
    if (e.target === modal) {
        closeProductModal();
    }
});

function selectVarietyForQuote() {
    const select = document.getElementById('variety');
    if (select && currentModalSelection) {
        // Map slug to selection values
        const mapper = {
            fine: 'Fine',
            medium: 'Medium',
            powder: 'Powder',
            flakes: 'Flakes',
            shreds: 'Shreds',
            reduced_fat: 'Reduced Fat'
        };
        select.value = mapper[currentModalSelection];
        closeProductModal();
        
        // Scroll smoothly to quote section
        document.getElementById('quote').scrollIntoView({ behavior: 'smooth' });
    }
}

/* ---------------------------------------------------------
   4. Typical Nutritional Analysis Calculator
   --------------------------------------------------------- */
function initYieldCalculator() {
    const input = document.getElementById('yieldInput');
    
    if (input) {
        input.addEventListener('input', () => {
            let val = parseFloat(input.value);
            if (isNaN(val) || val <= 0) val = 0;
            
            // Typical dry basis ranges:
            // Fat: 60 - 68%, Carbs: 20 - 25%, Protein: 6 - 8%, Fiber: 3 - 5%
            const fatMin = (val * 0.60).toFixed(2);
            const fatMax = (val * 0.68).toFixed(2);
            
            const carbsMin = (val * 0.20).toFixed(2);
            const carbsMax = (val * 0.25).toFixed(2);
            
            const proteinMin = (val * 0.06).toFixed(2);
            const proteinMax = (val * 0.08).toFixed(2);
            
            const fiberMin = (val * 0.03).toFixed(2);
            const fiberMax = (val * 0.05).toFixed(2);
            
            // Update UI values
            document.getElementById('valFat').textContent = `${fatMin} - ${fatMax} MT`;
            document.getElementById('valCarbs').textContent = `${carbsMin} - ${carbsMax} MT`;
            document.getElementById('valProtein').textContent = `${proteinMin} - ${proteinMax} MT`;
            document.getElementById('valFiber').textContent = `${fiberMin} - ${fiberMax} MT`;
            
            // Adjust visual progress bars (normalized width)
            document.getElementById('barFat').style.width = val > 0 ? '65%' : '0%';
            document.getElementById('barCarbs').style.width = val > 0 ? '22.5%' : '0%';
            document.getElementById('barProtein').style.width = val > 0 ? '7%' : '0%';
            document.getElementById('barFiber').style.width = val > 0 ? '4%' : '0%';
        });
    }
}

/* ---------------------------------------------------------
   5. Interactive Logistics & Packing Planner
   --------------------------------------------------------- */
function initLogisticsPlanner() {
    const slider = document.getElementById('volumeSlider');
    const bubble = document.getElementById('sliderValueBubble');
    const quoteQty = document.getElementById('quantity');
    
    if (slider) {
        slider.addEventListener('input', () => {
            const val = parseInt(slider.value);
            
            // Update bubble label
            bubble.textContent = `${val} MT`;
            
            // Sync with Quote Form field
            if (quoteQty) quoteQty.value = val;
            
            // Calculate details
            // 1 MT = 1000 kg. At 25 kg per bag, that's 40 bags per Ton
            const totalBags = val * 40;
            document.getElementById('calcBags').textContent = `${totalBags.toLocaleString()} Bags`;
            
            // Container recommendation
            let recommendation = "";
            if (val <= 2) {
                recommendation = "LCL (Less than Container Load) Shared Space";
            } else if (val <= 13) {
                recommendation = `1 x 20ft FCL Container (~${val} MT cargo)`;
            } else if (val <= 25) {
                recommendation = `1 x 40ft FCL Container (~${val} MT cargo)`;
            } else {
                const containers40ft = Math.floor(val / 25);
                const remainder = val % 25;
                if (remainder === 0) {
                    recommendation = `${containers40ft} x 40ft FCL Containers`;
                } else if (remainder <= 13) {
                    recommendation = `${containers40ft} x 40ft FCL + 1 x 20ft FCL`;
                } else {
                    recommendation = `${containers40ft + 1} x 40ft FCL Containers`;
                }
            }
            document.getElementById('calcContainers').textContent = recommendation;
        });

        // Inverse synchronization: Changing Quote Form quantity updates Logistics slider
        if (quoteQty) {
            quoteQty.addEventListener('input', () => {
                let val = parseInt(quoteQty.value);
                if (isNaN(val) || val <= 0) val = 1;
                if (val > 100) val = 100; // clamp to slider max for visual consistency
                slider.value = val;
                
                // Trigger slider calculation event
                slider.dispatchEvent(new Event('input'));
            });
        }
    }
}

/* ---------------------------------------------------------
   6. Global Shipping Map Paths highlighting
   --------------------------------------------------------- */
function initMapVisualizer() {
    const pins = document.querySelectorAll('.port-pin');
    const tooltip = document.getElementById('mapTooltip');
    
    pins.forEach(pin => {
        pin.addEventListener('mouseenter', () => {
            const port = pin.getAttribute('data-port');
            const transit = pin.getAttribute('data-transit');
            
            // Highlight specific path
            const mapper = {
                'Rotterdam': 'route-rotterdam',
                'Jebel Ali': 'route-jebel',
                'Singapore': 'route-singapore',
                'New York': 'route-ny'
            };
            
            const routeId = mapper[port];
            if (routeId) {
                const path = document.getElementById(routeId);
                if (path) path.classList.add('active');
            }
            
            // Update tooltip text
            if (tooltip) {
                tooltip.textContent = `Transit to ${port}: Approx. ${transit} from Tuticorin/Cochin. Click to select destination.`;
                tooltip.style.opacity = '1';
            }
        });
        
        pin.addEventListener('mouseleave', () => {
            const port = pin.getAttribute('data-port');
            const mapper = {
                'Rotterdam': 'route-rotterdam',
                'Jebel Ali': 'route-jebel',
                'Singapore': 'route-singapore',
                'New York': 'route-ny'
            };
            
            const routeId = mapper[port];
            if (routeId) {
                const path = document.getElementById(routeId);
                if (path) path.classList.remove('active');
            }
            
            if (tooltip) {
                tooltip.textContent = "Hover over a port to see shipping details.";
            }
        });

        // Click handler to pre-fill the quote form
        pin.addEventListener('click', () => {
            const port = pin.getAttribute('data-port');
            const fillMap = {
                'Rotterdam': { port: 'Port of Rotterdam', country: 'Netherlands' },
                'Jebel Ali': { port: 'Jebel Ali Port', country: 'United Arab Emirates' },
                'Singapore': { port: 'Port of Singapore', country: 'Singapore' },
                'New York': { port: 'Port of New York & New Jersey', country: 'United States' }
            };

            const fillData = fillMap[port];
            if (fillData) {
                const portInput = document.getElementById('port');
                const countryInput = document.getElementById('country');
                
                if (portInput) {
                    portInput.value = fillData.port;
                    portInput.classList.add('pulse-highlight');
                    setTimeout(() => portInput.classList.remove('pulse-highlight'), 1500);
                }
                if (countryInput) {
                    countryInput.value = fillData.country;
                    countryInput.classList.add('pulse-highlight');
                    setTimeout(() => countryInput.classList.remove('pulse-highlight'), 1500);
                }

                // Scroll to quote section
                const quoteSec = document.getElementById('quote');
                if (quoteSec) {
                    quoteSec.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

/* ---------------------------------------------------------
   7. Quote Enquiry Form Controller (AJAX Submit)
   --------------------------------------------------------- */
function initQuoteForm() {
    const form = document.getElementById('quoteForm');
    const successBanner = document.getElementById('formSuccess');
    const errorBanner = document.getElementById('formError');
    const successMsg = document.getElementById('successMsg');
    const errorMsg = document.getElementById('errorMsg');
    const submitBtn = document.getElementById('submitBtn');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Reset previous errors
            successBanner.classList.add('hidden');
            errorBanner.classList.add('hidden');
            
            // Read inputs
            const name = document.getElementById('name').value.trim();
            const company = document.getElementById('company').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const country = document.getElementById('country').value.trim();
            const port = document.getElementById('port').value.trim();
            const variety = document.getElementById('variety').value;
            const quantity = document.getElementById('quantity').value.trim();
            const packaging = document.getElementById('packaging').value;
            const message = document.getElementById('message').value.trim();
            
            // Client side validation
            if (!name || !email || !country || !variety || !quantity) {
                errorMsg.textContent = "Please fill out all required fields (Name, Email, Country, Variety, Quantity).";
                errorBanner.classList.remove('hidden');
                return;
            }
            
            // Save to Firebase Firestore from client-side
            if (db) {
                try {
                    await db.collection("quotes").add({
                        name: name,
                        company: company,
                        email: email,
                        phone: phone,
                        country: country,
                        destination_port: port,
                        variety: variety,
                        quantity_MT: quantity,
                        packaging: packaging,
                        message: message,
                        created_at: firebase.firestore.FieldValue.serverTimestamp(),
                        timestamp: new Date().toISOString()
                    });
                    console.log("Quote successfully stored in Firebase Firestore");
                } catch (fbErr) {
                    console.warn("Client-side Firebase store warning:", fbErr);
                }
            }

            try {
                const response = await fetch('/submit_quote', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name, company, email, phone, country, port, variety, quantity, packaging, message
                    })
                });
                
                const result = await response.get_json ? await response.get_json() : await response.json();
                
                if (response.ok && result.success) {
                    successMsg.textContent = result.message;
                    successBanner.classList.remove('hidden');
                    form.reset();
                    // Reset Logistics Slider visual bubble
                    document.getElementById('volumeSlider').value = 12;
                    document.getElementById('sliderValueBubble').textContent = '12 MT';
                    document.getElementById('volumeSlider').dispatchEvent(new Event('input'));
                } else {
                    errorMsg.textContent = result.message || "Failed to process quote request. Please try again.";
                    errorBanner.classList.remove('hidden');
                }
            } catch (err) {
                errorMsg.textContent = "A network error occurred. Please verify your connection and try again.";
                errorBanner.classList.remove('hidden');
                console.error("Quote submission error:", err);
            } finally {
                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Submit Quote Request</span> <i class="fa-solid fa-paper-plane"></i>`;
            }
        });
    }
}
