import React from 'react';

function Form() {
return (
<form>
<label>Title:</label>
<input type="text" id="title" name="title"/><br/>
<label>Text:</label>
<textarea id="text" name="text"></textarea><br/>
<button type="submit">Submit</button>
</form>
);
}

export default Form;
