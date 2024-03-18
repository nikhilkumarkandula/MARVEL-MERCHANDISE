 const express = require('express');
 const mongoose = require('mongoose');
 const bodyParser = require('body-parser');
 const prompt=require('prompt-sync')();
 const path=require('path');
 const app = express();
 const port = 3000;
 let emailId="";

 // Connect to your MongoDB instance (replace 'mongodb://localhost/mydatabase' with your MongoDB URL)
 mongoose.connect('mongodb://127.0.0.1:27017/marvel', { useNewUrlParser: true, 
useUnifiedTopology: true });

// Create a Mongoose model (schema)
const avengers = mongoose.model('avengers', {
	fname: String,
	lname: String,
	gender: String, 
    user_name: String,
    email: String,
    password: String
 });
 
// Create a Mongoose model (schema) for cart itmes
const merchandise = mongoose.model('merchandise', {
  user_name: String,
  size: String,
  color: String,
});

 // Middleware for parsing form data
 app.use(bodyParser.urlencoded({ extended: true }));

 app.use(express.static(path.join(__dirname, 'public')));
 
 // Serve the Sign-up form
 app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'/public/account.html'));
 });
 
 // Handle form submission
 app.post('/Sign-up', (req, res) => {
  const { fname,lname,gender,user_name, email, password } = req.body;
  
  // Create a new User document and save it to MongoDB
  const user = new avengers({ fname,lname,gender,user_name, email, password });
     user.save()
     .then(() => {
         
         const errorMessage = 'Registration Done Successfully!';
         return res.status(400).send(`
         <script>
             alert("${errorMessage}");
             window.location.href = "/account.html";
         </script>
         `);
  })
 
  .catch((err) => {
  console.error(err);
     res.status(500).send('Error While registering your account Please try agian.');
  });
  });


// Serve the login form

app.get('/SignIn', (req, res) => {
    const { email, password } = req.query;
    emailId=req.query.email;
    // Check if the entered details exist in the database
    avengers.findOne({email, password }).exec()
    .then(data => {
      if (data) {
        const errorMessage = 'Login Succesfully! Enjoy the asthetic Marvel Merchandise';
        const name =  data.user_name;
        res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/home.html?name=${data.user_name}";
        </script>
        `);
        email_=email;

      } else {
        const errorMessage = 'INVALID LOGIN CREDENTIALS';
        res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/";
        </script>
        `);
      }
    })
    .catch(err => {
      console.error(err);
      const errorMessage = 'An error occurred while finding user.';
      res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/";
        </script>`)
    });
});


// viewing all users
  app.get('/users', async (req, res) => {
  try {
      const users = await avengers.find({}); // Find all users in the database

      // Check if there are users to display
      if (users.length > 0) {
          // Create an HTML table to display user information
          let table = '<table border="1px" align="center" size=10>';
          table += '<tr><th>Name</th><th>Email</th></tr>';

          users.forEach(user => {
              table += `<tr><td>${user.user_name}</td><td>${user.email}</td></tr>`;
          });

          table += '</table>';

          // Send the table as an HTML response
          res.send(table);
      } else {
          res.send('No users found.'); // Handle the case where there are no users to display
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while fetching users.');
  }
});

// updating a value from console

app.use(express.json());

app.get('/update-user', (req, res) => {
  try {
    res.status(400).send(`
      <script>
        const user_name = prompt('Enter the username of the user to update: ');
        const newEmail = prompt('Enter the new email address: ');
      </script>
    `);
    const user_name = prompt('Enter the username of the user to update: ');
        const newEmail = prompt('Enter the new email address: ');
    // Find the user by username and update their email
    avengers.findOneAndUpdate(
      { user_name },
      { email: newEmail },
      { new: true }
    )
    .then(updatedUser => {
      if (updatedUser) {
        const errorMessage="Updated Succesfully !";
        res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/data.html";
        </script>`);
      } else {
        res.status(404).send('User not found');
      }
    }).catch(err => {
      console.error(err);
      res.status(500).send('An error occurred while updating user data.');
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while updating user data.');
  }
});

// Deleting a record from console

app.get('/delete-user', async(req, res) => {
  const  user_name = prompt("Enter user name: ")

  try {
    const result = await avengers.deleteOne({ user_name });

    if (result.deletedCount > 0) {
      console.log('User deleted successfully');
      res.send('User deleted successfully');
    } else {
      console.log('User not found');
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error('Error while deleting the record:', err);
    res.status(500).send('Error occurred while deleting the user');
  }
});

 // updating value via browser
 app.get('/forgot', (req, res) => {
  try {
    const { email, newpassword } = req.query;
    // Find the user by username and update their email
    avengers.findOneAndUpdate(
      { email },
      { password: newpassword },
      { new: true }
    )
    .then(updatedUser => {
      if (updatedUser) {
        const errorMessage="Updated Succesfully !";
        res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/home.html";
        </script>`);
      } else {
        const errorMessage="INVALID DETAILS !";
        res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/";
        </script>`);
      }
    }).catch(err => {
      console.error(err);
      const errorMessage="An error occurred while updating user data.";
        res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/home.html";
        </script>`);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while updating user data.');
  }
});

  // deleting user via delete button
    app.get('/delete', async(req, res) => {
      console.log(emailId);
      //const { userId } = req.body; // Retrieve the identifier from the request body

      // Perform the deletion operation in the database
      // Example using Mongoose: User.deleteOne({ _id: userId }, (err) => {...});
      try {
        const result = await avengers.findOneAndDelete({ email:emailId });
        
        if ( result ) {
          console.log('User deleted successfully');
          const errorMessage="User deleted Login again !";
        res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/account.html";
        </script>`);
        } else {
          console.log('User not found');
          res.status(404).send('User not found');
        }
      } catch (err) {
        console.error('Error while deleting the record:', err);
        res.status(500).send('Error occurred while deleting the user');
        // Respond to the client with the result
      // Respond with a success status code (204: No Content)
      }
    });
  
// cart items storage
app.post('/buy', (req, res) => {
  const { user_name, size, color } = req.body;
  
  var data = {
    "name":user_name,
    "email":email_,
    "size":size,
    "product":product,
    "Address":address,
  
  }
  const user = new merchandise({ user_name, size, color });
     user.save()
     .then(() => {
         
         const errorMessage = 'Thank You buy again!';
         return res.status(400).send(`
         <script>
             alert("${errorMessage}");
             window.location.href = "/hoodies.html";
         </script>
         `);
  })
 
  .catch((err) => {
  console.error(err);
     res.status(500).send('Error While buying Please try agian.');
  });
  });
 

// cart items view
// Create a new User document and save it to MongoDB


 // Start the server
 app.listen(port, () => {
 console.log(`Server is running on port ${port}`);
 });


/*
    9 - 18       -- moongose connection and schema
   25 - 52       -- inserting values (Sign up form)
   55 - 91       -- retrieving values (Login form)
   94 - 103      -- viewing all users
  105 - 144      -- updating using console
  146 - 165      -- deleting using console
  167 - 206      -- updating on browser(forgot password)
  208 - 231      -- deleting on browser
*/ 