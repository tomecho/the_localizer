Let's make a simple library which scans dom elements passes it to google translate and updates the content

# Frontend
Small library which identifies text 

## Open Issues
* ignore selectors configuration option 
* translation element history was a half baked idea to prevent retranslating content but it doesn't work yet
* should we throttle the mutation observer?
* unit tests?
* items render on the page before the content is translated, is that ok?
* what happens if an element's text is edited, do we capture that?

# Backend 
Is it needed? Probably yes because the free google api has limits

# Testing
Run `npm test` to build the project and inject it into the "test site" sandbox.  You can edit testsite/ to create other tests.