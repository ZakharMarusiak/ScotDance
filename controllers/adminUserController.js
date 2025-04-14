const UserModel = require('../models/UserModel');

exports.listOrganisers = (req, res) => {
    UserModel.getAll((err, users) => {
        if (err) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "Failed to load organisers.");
                    window.location.href = "/admin/courses";
                </script>
            `);
        }

        res.render('admin/users', {
            title: 'Manage Organisers',
            users
        });
    });
};

exports.addOrganiser = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.send(`
            <script>
                localStorage.setItem("error", "Username and password are required.");
                window.location.href = "/admin/organisers";
            </script>
        `);
    }

    UserModel.findByUsername(username, (err, existingUser) => {
        if (err) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "Error checking existing user.");
                    window.location.href = "/admin/organisers";
                </script>
            `);
        }

        if (existingUser) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "Username already exists.");
                    window.location.href = "/admin/organisers";
                </script>
            `);
        }

        UserModel.add({ username, password }, (err) => {
            if (err) {
                return res.send(`
                    <script>
                        localStorage.setItem("error", "Failed to add organiser.");
                        window.location.href = "/admin/organisers";
                    </script>
                `);
            }

            return res.send(`
                <script>
                    localStorage.setItem("success", "Organiser added successfully.");
                    window.location.href = "/admin/organisers";
                </script>
            `);
        });
    });
};

exports.deleteOrganiser = (req, res) => {
    const { id } = req.params;

    UserModel.deleteById(id, (err) => {
        if (err) {
            return res.send(`
                <script>
                    localStorage.setItem("error", "Failed to delete organiser.");
                    window.location.href = "/admin/organisers";
                </script>
            `);
        }

        return res.send(`
            <script>
                localStorage.setItem("success", "Organiser deleted successfully.");
                window.location.href = "/admin/organisers";
            </script>
        `);
    });
};