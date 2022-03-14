# PingID SDK to PingOne Migration

## Email content migration script

### Installation

Run in terminal:

`npm install`

### Usage

Run in terminal:

`node migrate_templates <pingidsdk.properties>`

Where *pingidsdk.properties* is the location of your PingID SDK *.properties* file downloaded from the admin portal (https://admin.pingone.com/)
Follow the on-screen instructions, here's an example flow:

First, you are presented with a list of your SDK applications (that were linked to a V2 environment)

```
reading pingidsdk.properties
account:  6f585b0e-d090-4bc3-96ba-a509684dcddb
Applications: 
(1) coocoo (ID: 77aea535-3240-4fc9-b5b6-c140685b67bd)
Choose application: 1
```
In this example, application (1) (which is the only one in this case) was selected.

Next, you are asked which V1 Email configuration you'd like to migrate:

```
Email configurations types: 
(1) authentication_123
(2) pairing
(3) authentication_email
(4) authentication
Choose Email configuration type to migrate: 1
```

In this example, the application has 4 distinct types that can be migrated, and type (1) was selected

Next, you are asked to select the target email template to migrate to, this is a list of hard-coded templates that V2 has.
 
```
Email templates: 
(1)  Device Pairing
(2)  Strong Authentication
(3)  Transaction
Choose target template to migrate to: 3
```
In this example, type (3) was selected. once selected the migration will start. upon completion, the following is shown:

```
 
migrating of type=authentication_123 locale=en OK
finished migrating type="authentication_123", migrate another type? y/n:
```
You can type "y" to migrate another type, or "n" to quit (you can always re-run the script if you'd like to migrate additional templates)

### Disclaimer

This software is open sourced by Ping Identity but not supported commercially as such. Any questions/issues should go to the Github issues tracker or discuss on the [Ping Identity developer communities] . See also the DISCLAIMER file in this directory.

[Ping Identity developer communities]: https://community.pingidentity.com/collaborate
[Ping Identity Developer Site]: https://developer.pingidentity.com/connect
