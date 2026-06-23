// LocalStorage Wrapper for SPK Data

const STORE_KEY_CRITERIA = 'spk_laptop_criteria';
const STORE_KEY_ALTERNATIVES = 'spk_laptop_alternatives';

const Store = {
    // Get all criteria
    getCriteria: () => {
        const data = localStorage.getItem(STORE_KEY_CRITERIA);
        return data ? JSON.parse(data) : [];
    },
    
    // Save criteria array
    saveCriteria: (criteria) => {
        localStorage.setItem(STORE_KEY_CRITERIA, JSON.stringify(criteria));
    },

    // Get a specific criterion by ID
    getCriterionById: (id) => {
        const criteria = Store.getCriteria();
        return criteria.find(c => c.id === id);
    },

    // Get all alternatives
    getAlternatives: () => {
        const data = localStorage.getItem(STORE_KEY_ALTERNATIVES);
        return data ? JSON.parse(data) : [];
    },

    // Save alternatives array
    saveAlternatives: (alternatives) => {
        localStorage.setItem(STORE_KEY_ALTERNATIVES, JSON.stringify(alternatives));
    },

    // Initialize data from sample-data.json if LocalStorage is empty
    initData: async () => {
        const hasCriteria = localStorage.getItem(STORE_KEY_CRITERIA);
        const hasAlternatives = localStorage.getItem(STORE_KEY_ALTERNATIVES);

        if (!hasCriteria || !hasAlternatives) {
            try {
                const response = await fetch('data/sample-data.json');
                if (!response.ok) throw new Error('Failed to fetch sample data');
                
                const data = await response.json();
                
                if (!hasCriteria && data.criteria) {
                    Store.saveCriteria(data.criteria);
                }
                
                if (!hasAlternatives && data.alternatives) {
                    Store.saveAlternatives(data.alternatives);
                }
            } catch (error) {
                console.error("Error loading sample data:", error);
                // Fallback to minimal empty if fetch fails
                if (!hasCriteria) Store.saveCriteria([]);
                if (!hasAlternatives) Store.saveAlternatives([]);
            }
        }
    },
    
    // Clear all data
    clearAll: () => {
        localStorage.removeItem(STORE_KEY_CRITERIA);
        localStorage.removeItem(STORE_KEY_ALTERNATIVES);
    }
};
