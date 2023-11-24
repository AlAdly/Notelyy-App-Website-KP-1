/**
 * GET/
 * Homepage
 */
exports.homepage = async (req, res) => {
        const locals = {
            title: 'Notely App',
            description: 'Application notes website.',
        }
    
        res.render('index', {
            locals,
            layout: '../views/layouts/front-page'
        })
        
    
};
