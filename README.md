# Reservation App

Reservation app created with Next.js, Prisma, tRPC, Tailwind, and Next-auth.

## How to run the project?

First of all, you have to make a copy of the `.env.example` file and name it to `.env`.
Then, create another copy of the `/var/.env.example` file and name it to `.env` inside the `var` folder. This file will be holding Postgres variables that will be used for the development.

Now, you should give a correct value to the `DATABASE_URL` variable so the Prisma connect to that database.

Also create a secret for the `NEXTAUTH_SECRET` variable using this command in your terminal:
```sh
openssl rand -base64 32
```

After that, you have to create an Discord Application with your personal account, and set the client id and client secret to `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` variables.

Now you are good to go. Run the app and enjoy!