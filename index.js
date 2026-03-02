 // Inicializar Iconos
        lucide.createIcons();

        // Estado inicial
        let transactions = JSON.parse(localStorage.getItem('aesthetic_finances_html')) || [];
        let currentType = 'ingreso';

        // Referencias a elementos del DOM
        const historyContainer = document.getElementById('historyContainer');
        const transactionForm = document.getElementById('transactionForm');
        const btnIngreso = document.getElementById('btnIngreso');
        const btnGasto = document.getElementById('btnGasto');
        const descriptionInput = document.getElementById('descriptionInput');
        const amountInput = document.getElementById('amountInput');
        
        // Elementos de resumen
        const totalIncomeEl = document.getElementById('totalIncome');
        const totalExpenseEl = document.getElementById('totalExpense');
        const netProfitEl = document.getElementById('netProfit');

        // Formateador de dinero (Moneda por defecto USD, para El Salvador u otro país dolarizado)
        const formatMoney = (value) => {
            return new Intl.NumberFormat('es-SV', {
                style: 'currency',
                currency: 'USD'
            }).format(value);
        };

        // Cambiar entre tipo de registro (Ingreso / Gasto)
        window.setType = (type) => {
            currentType = type;
            
            // Actualizar estilos de los botones
            if (type === 'ingreso') {
                btnIngreso.className = "py-3 px-4 rounded-xl text-sm font-medium transition-all bg-white text-[#5FC5A8] shadow-sm";
                btnGasto.className = "py-3 px-4 rounded-xl text-sm font-medium transition-all text-[#A8929E] hover:text-[#5D4A55]";
                descriptionInput.placeholder = "Ej. Venta de labiales";
            } else {
                btnGasto.className = "py-3 px-4 rounded-xl text-sm font-medium transition-all bg-white text-[#F28C9C] shadow-sm";
                btnIngreso.className = "py-3 px-4 rounded-xl text-sm font-medium transition-all text-[#A8929E] hover:text-[#5D4A55]";
                descriptionInput.placeholder = "Ej. Pedido a proveedor";
            }
        };

        // Eliminar Transacción
        window.deleteTransaction = (id) => {
            transactions = transactions.filter(t => t.id !== id);
            saveAndRender();
        };

        // Generar un ID único (para compatibilidad en navegadores sin crypto.randomUUID)
        const generateID = () => {
            return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
        };

        // Manejar el envío del formulario
        transactionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const description = descriptionInput.value.trim();
            const amount = parseFloat(amountInput.value);

            if (!description || isNaN(amount)) return;

            const newTransaction = {
                id: crypto.randomUUID ? crypto.randomUUID() : generateID(),
                description,
                amount,
                type: currentType,
                date: new Date().toLocaleDateString('es-ES', { 
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                })
            };

            // Añadir al inicio de la lista
            transactions.unshift(newTransaction);
            
            // Limpiar formulario
            descriptionInput.value = '';
            amountInput.value = '';
            
            saveAndRender();
        });

        // Guardar en localStorage y actualizar la interfaz
        const saveAndRender = () => {
            localStorage.setItem('aesthetic_finances_html', JSON.stringify(transactions));
            renderUI();
        };

        // Renderizar la Interfaz
        const renderUI = () => {
            // 1. Calcular Totales
            const totalIncome = transactions
                .filter(t => t.type === 'ingreso')
                .reduce((acc, curr) => acc + curr.amount, 0);
                
            const totalExpense = transactions
                .filter(t => t.type === 'gasto')
                .reduce((acc, curr) => acc + curr.amount, 0);
                
            const netProfit = totalIncome - totalExpense;

            // 2. Actualizar textos de resumen
            totalIncomeEl.innerText = formatMoney(totalIncome);
            totalExpenseEl.innerText = formatMoney(totalExpense);
            netProfitEl.innerText = formatMoney(netProfit);

            // 3. Renderizar el Historial
            if (transactions.length === 0) {
                historyContainer.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-48 text-center space-y-4 fade-in">
                        <div class="w-16 h-16 bg-[#FFF5F8] rounded-full flex items-center justify-center">
                            <i data-lucide="package" class="w-8 h-8 text-[#EBC2CB]" stroke-width="1.5"></i>
                        </div>
                        <p class="text-[#A8929E] font-light">Aún no tienes registros.<br/>Comienza agregando tu primer pedido o venta.</p>
                    </div>
                `;
            } else {
                historyContainer.innerHTML = transactions.map((t) => {
                    const isIngreso = t.type === 'ingreso';
                    
                    const bgClass = isIngreso ? 'bg-[#E8F8F5]' : 'bg-[#FFEBF0]';
                    const textClass = isIngreso ? 'text-[#5FC5A8]' : 'text-[#F28C9C]';
                    const iconName = isIngreso ? 'trending-up' : 'trending-down';
                    const sign = isIngreso ? '+' : '-';

                    return `
                        <div class="group flex items-center justify-between p-4 hover:bg-[#FFF5F8] rounded-2xl transition-colors border border-transparent hover:border-[#FCEEF2] fade-in">
                            <div class="flex items-center gap-4">
                                <div class="p-3 rounded-2xl flex-shrink-0 ${bgClass} ${textClass}">
                                    <i data-lucide="${iconName}" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <p class="font-medium text-[#4A3B43]">${t.description}</p>
                                    <p class="text-xs text-[#A8929E] mt-0.5">${t.date}</p>
                                </div>
                            </div>
                            
                            <div class="flex items-center gap-4">
                                <span class="font-medium ${textClass}">
                                    ${sign}${formatMoney(t.amount)}
                                </span>
                                <button 
                                    onclick="deleteTransaction('${t.id}')"
                                    class="opacity-0 group-hover:opacity-100 p-2 text-[#EBC2CB] hover:text-[#F28C9C] transition-all rounded-xl hover:bg-white"
                                    title="Eliminar"
                                >
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            // Re-renderizar iconos de Lucide para los nuevos elementos en el DOM
            lucide.createIcons();
        };

        // Renderizado inicial al cargar la página
        renderUI();
