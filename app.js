const supabaseUrl = "https://edaxqmayxajztfcsouqg.supabase.co";

const supabaseKey = "sb_publishable_86yyo8GVbSp02Yjxs4CfVQ_HvzKINpH";

const { createClient } = supabase;

const client = createClient(supabaseUrl, supabaseKey);

console.log(client);


// signup

let signupForm = document.querySelector("#formData");

let signup = document.querySelector("#signupBtn");


if (signup && !signupForm) {

    signup.addEventListener("click", (event) => {

        event.preventDefault();

        window.location.href = "./signup.html";

    });

}


if (signupForm) {

    signupForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        try {

            const data = new FormData(signupForm);

            let emptyField = false;

            let inputs = document.querySelectorAll("input");


            inputs.forEach((input) => {

                if (input.value === "") {

                    input.style.border = "2px solid red";

                    emptyField = true;

                }

            });


            if (emptyField) {

                alert("Please fill all fields");

                return;

            }


            const allData = Object.fromEntries(data);

            const { email, password, name } = allData;


            const { data: signupdata, error } =
                await client.auth.signUp({
                    email: email,
                    password: password
                });


            console.log(signupdata);
            console.log(error);


            if (error) {

                alert(error.message);

                return;

            }


            let id = signupdata.user.id;


            const { error: signuperror } =
                await client
                    .from("recipe_data")
                    .insert({
                        name: name,
                        user_id: id
                    });


            console.log(signuperror);


            if (signuperror) {

                alert(signuperror.message);

                return;

            }


            alert("Signup successful!");

            window.location.href = "./login.html";

        }
        catch (error) {

            console.log(error);

        }

    });

}


// input border

let inputs = document.querySelectorAll("input");


inputs.forEach((input) => {

    input.addEventListener("input", () => {

        if (input.value !== "") {

            input.style.border = "";

        }

    });

});


// index page login button

let goLogin = document.querySelector("#goLogin");


goLogin && goLogin.addEventListener("click", (event) => {

    event.preventDefault();

    window.location.href = "./login.html";

});


// login

let loginForm = document.querySelector("#loginForm");

let email = document.querySelector("#email");

let password = document.querySelector("#password");

let loginSignupBtn = document.querySelector("#signupBtn");


if (loginSignupBtn && loginForm) {

    loginSignupBtn.addEventListener("click", (event) => {

        event.preventDefault();

        window.location.href = "./signup.html";

    });

}


if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        try {

            const { data: signindata, error: signinerror } =
                await client.auth.signInWithPassword({
                    email: email.value,
                    password: password.value
                });


            console.log("Login Data:", signindata);

            console.log("Login Error:", signinerror);


            if (signinerror) {

                if (typeof Swal !== "undefined") {

                    Swal.fire({
                        icon: "error",
                        title: "Login Failed",
                        text: signinerror.message
                    });

                }
                else {

                    alert(signinerror.message);

                }

                return;

            }


            if (typeof Swal !== "undefined") {

                Swal.fire({
                    icon: "success",
                    title: "Login Successful",
                    text: "Welcome back!"
                }).then(() => {

                    window.location.href = "./dashboard.html";

                });

            }
            else {

                window.location.href = "./dashboard.html";

            }

        }
        catch (error) {

            console.log(error);

        }

    });

}


// dashboard protection

if (
    document.querySelector("#total") ||
    document.querySelector("#mine") ||
    document.querySelector("#recipes")
) {

    const checkUser = async () => {

        const { data, error } =
            await client.auth.getSession();


        console.log("Dashboard Session:", data);

        console.log("Dashboard Error:", error);


        if (error || !data.session) {

            window.location.href = "./login.html";

            return;

        }

    };


    checkUser();

}


// dashboard total recipes

let totalBox = document.querySelector("#total");


if (totalBox) {

    const getTotal = async () => {

        const { data, error } =
            await client
                .from("recipes")
                .select("id");


        console.log("Total Recipes:", data);

        console.log("Total Error:", error);


        if (error) {

            console.log(error);

            return;

        }


        totalBox.innerText = data.length;

    };


    getTotal();

}


// dashboard my recipes count

let mineBox = document.querySelector("#mine");


if (mineBox) {

    const getMine = async () => {

        try {

            const { data, error } =
                await client.auth.getSession();


            console.log("Session:", data);

            console.log("Session Error:", error);


            if (error || !data.session) {

                return;

            }


            let userId = data.session.user.id;


            const { data: recipes, error: recipeError } =
                await client
                    .from("recipes")
                    .select("id")
                    .eq("user_id", userId);


            console.log("My Recipes:", recipes);

            console.log("Recipe Error:", recipeError);


            if (recipeError) {

                console.log(recipeError);

                return;

            }


            mineBox.innerText = recipes.length;

        }
        catch (error) {

            console.log(error);

        }

    };


    getMine();

}


// dashboard recent recipes

let recipesBox = document.querySelector("#recipes");


if (recipesBox) {

    const getRecipes = async () => {

        const { data, error } =
            await client
                .from("recipes")
                .select(
                    "id, title, description, category, cooking_time"
                )
                .order("created_at", {
                    ascending: false
                })
                .limit(6);


        console.log("Recent Recipes:", data);

        console.log("Recent Error:", error);


        if (error) {

            console.log(error);

            return;

        }


        recipesBox.innerHTML = "";


        data.forEach((recipe) => {

            recipesBox.innerHTML += `

                <div class="col-12 col-md-6 col-lg-4">

                    <div class="card h-100">

                        <div class="card-body">

                            <h5>${recipe.title}</h5>

                            <p>${recipe.description}</p>

                            <p>
                                Category: ${recipe.category}
                            </p>

                            <p>
                                Cooking Time:
                                ${recipe.cooking_time}
                            </p>

                        </div>

                    </div>

                </div>

            `;

        });

    };


    getRecipes();

}


// create recipe

let recipeForm = document.querySelector("#recipe");


if (recipeForm) {

    let titleBox =
        document.querySelector("#recipeTitle");

    let descriptionBox =
        document.querySelector("#recipeDescription");

    let categoryBox =
        document.querySelector("#recipeCategory");

    let ingredientsBox =
        document.querySelector("#recipeIngredients");

    let instructionsBox =
        document.querySelector("#recipeInstructions");

    let timeBox =
        document.querySelector("#recipeTime");

    let pictureBox =
        document.querySelector("#recipePic");


    recipeForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        try {

            const { data, error } =
                await client.auth.getSession();


            if (error || !data.session) {

                alert("Please Login First");

                window.location.href = "./login.html";

                return;

            }


            let userId = data.session.user.id;

            let imageUrl = "";


            if (pictureBox.files.length > 0) {

                let image = pictureBox.files[0];

                let imageName =
                    Date.now() + "-" + image.name;


                const { data: upload, error: uploadError } =
                    await client.storage
                        .from("recipe_images")
                        .upload(imageName, image);


                console.log(upload);

                console.log(uploadError);


                if (uploadError) {

                    alert(uploadError.message);

                    return;

                }


                const { data: url } =
                    client.storage
                        .from("recipe_images")
                        .getPublicUrl(imageName);


                imageUrl = url.publicUrl;

            }


            const { error: saveError } =
                await client
                    .from("recipes")
                    .insert({
                        user_id: userId,
                        title: titleBox.value,
                        description: descriptionBox.value,
                        category: categoryBox.value,
                        ingredients: ingredientsBox.value,
                        instructions: instructionsBox.value,
                        cooking_time: timeBox.value,
                        image_url: imageUrl
                    });


            if (saveError) {

                console.log(saveError);

                alert(saveError.message);

                return;

            }


            alert("Recipe Added Successfully");

            recipeForm.reset();

        }
        catch (error) {

            console.log(error);

        }

    });

}


// my recipes page

let savedList =
    document.querySelector("#savedRecipeList");


if (savedList) {

    const showMyRecipes = async () => {

        try {

            const { data, error } =
                await client.auth.getSession();


            console.log("Session:", data);

            console.log("Session Error:", error);


            if (error || !data.session) {

                alert("Please Login First");

                window.location.href = "./login.html";

                return;

            }


            let userId = data.session.user.id;


            const { data: recipes, error: recipeError } =
                await client
                    .from("recipes")
                    .select(
                        "id, title, description, category, ingredients, instructions, cooking_time, image_url"
                    )
                    .eq("user_id", userId);


            console.log("My Recipes:", recipes);

            console.log("Recipe Error:", recipeError);


            if (recipeError) {

                console.log(recipeError);

                return;

            }


            savedList.innerHTML = "";


            if (recipes.length === 0) {

                savedList.innerHTML = `

                    <div class="col-12">

                        <h4>No Recipes Found</h4>

                        <p>
                            You have not added any recipes yet.
                        </p>

                    </div>

                `;

                return;

            }


            recipes.forEach((recipe) => {

                savedList.innerHTML += `

                    <div class="col-12 col-md-6 col-lg-4">

                        <div class="card h-100">

                            <img
                                src="${recipe.image_url}"
                                class="card-img-top"
                            >

                            <div class="card-body">

                                <h5>${recipe.title}</h5>

                                <p>
                                    ${recipe.description}
                                </p>

                                <p>
                                    Category:
                                    ${recipe.category}
                                </p>

                                <p>
                                    Cooking Time:
                                    ${recipe.cooking_time}
                                </p>

                                <button
                                    class="btn btn-dark updateRecipe"
                                    data-id="${recipe.id}">
                                    Edit
                                </button>

                                <button
                                    class="btn btn-danger removeRecipe"
                                    data-id="${recipe.id}"
                                    data-image="${recipe.image_url}">
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>

                `;

            });


            let deleteBtns =
                document.querySelectorAll(".removeRecipe");


            deleteBtns.forEach((button) => {

                button.addEventListener("click", async () => {

                    let recipeId =
                        button.getAttribute("data-id");

                    let imageUrl =
                        button.getAttribute("data-image");


                    try {

                        if (imageUrl) {

                            let imagePath =
                                imageUrl.split("/recipe_images/")[1];


                            if (imagePath) {

                                const { error: imageError } =
                                    await client.storage
                                        .from("recipe_images")
                                        .remove([imagePath]);


                                if (imageError) {

                                    console.log(imageError);

                                }

                            }

                        }


                        const { error } =
                            await client
                                .from("recipes")
                                .delete()
                                .eq("id", recipeId);


                        if (error) {

                            console.log(error);

                            alert(error.message);

                            return;

                        }


                        alert("Recipe Deleted Successfully");

                        location.reload();

                    }
                    catch (error) {

                        console.log(error);

                    }

                });

            });


            let editBtns =
                document.querySelectorAll(".updateRecipe");


            editBtns.forEach((button) => {

                button.addEventListener("click", async () => {

                    let recipeId =
                        button.getAttribute("data-id");


                    let title =
                        prompt("Enter Recipe Title");

                    let description =
                        prompt("Enter Recipe Description");

                    let category =
                        prompt("Enter Category");

                    let ingredients =
                        prompt("Enter Ingredients");

                    let instructions =
                        prompt("Enter Instructions");

                    let cookingTime =
                        prompt("Enter Cooking Time");


                    if (title == null) {
                        return;
                    }

                    if (description == null) {
                        return;
                    }

                    if (category == null) {
                        return;
                    }

                    if (ingredients == null) {
                        return;
                    }

                    if (instructions == null) {
                        return;
                    }

                    if (cookingTime == null) {
                        return;
                    }


                    const { error } =
                        await client
                            .from("recipes")
                            .update({
                                title: title,
                                description: description,
                                category: category,
                                ingredients: ingredients,
                                instructions: instructions,
                                cooking_time: cookingTime
                            })
                            .eq("id", recipeId);


                    if (error) {

                        console.log(error);

                        alert(error.message);

                        return;

                    }


                    alert("Recipe Updated Successfully");

                    location.reload();

                });

            });

        }
        catch (error) {

            console.log(error);

        }

    };


    showMyRecipes();

}


// logout

let logout =
    document.querySelector("#logout");


if (logout) {

    logout.addEventListener("click", async () => {

        const { error } =
            await client.auth.signOut();


        if (error) {

            console.log(error);

            return;

        }


        window.location.href = "./login.html";

    });

}


// all recipes button

let dishBtn =
    document.querySelector("#dish");


dishBtn && dishBtn.addEventListener("click", (event) => {

    event.preventDefault();

    window.location.href = "./all-recipes.html";

});


// all recipes page

if (document.querySelector("#recipesList")) {

    let recipeSearch =
        document.querySelector("#recipeSearch");

    let recipeCategory =
        document.querySelector("#recipeCategory");

    let recipesList =
        document.querySelector("#recipesList");


    recipeCategory.innerHTML = `

        <option value="">
            All Categories
        </option>

        <option value="Pakistani">
            Pakistani
        </option>

        <option value="Italian">
            Italian
        </option>

        <option value="Chinese">
            Chinese
        </option>

        <option value="Desserts">
            Desserts
        </option>

        <option value="Fast Food">
            Fast Food
        </option>

        <option value="Healthy">
            Healthy
        </option>

    `;


    const loadRecipes = async () => {

        try {

            const { data, error } =
                await client
                    .from("recipes")
                    .select(
                        "id, title, description, category, ingredients, cooking_time, image_url"
                    );


            console.log("All Recipes:", data);

            console.log("All Recipes Error:", error);


            if (error) {

                console.log(error);

                return;

            }


            recipesList.innerHTML = "";


            data.forEach((recipe) => {

                recipesList.innerHTML += `

                    <div
                        class="col-12 col-md-6 col-lg-4 recipeCard"
                        data-category="${recipe.category}"
                    >

                        <div class="card h-100">

                            <img
                                src="${recipe.image_url}"
                                class="card-img-top"
                            >

                            <div class="card-body">

                                <h5>${recipe.title}</h5>

                                <p>
                                    ${recipe.description}
                                </p>

                                <p>
                                    Category:
                                    ${recipe.category}
                                </p>

                                <p>
                                    Cooking Time:
                                    ${recipe.cooking_time}
                                </p>

                                <p>
                                    Ingredients:
                                    ${recipe.ingredients}
                                </p>

                                <button
                                    class="btn btn-dark detailsBtn"
                                    data-id="${recipe.id}">
                                    View Details
                                </button>

                            </div>

                        </div>

                    </div>

                `;

            });


            let detailsBtns =
                document.querySelectorAll(".detailsBtn");


            detailsBtns.forEach((button) => {

                button.addEventListener("click", () => {

                    let id =
                        button.getAttribute("data-id");


                    window.location.href =
                        "./recipe-details.html?id=" + id;

                });

            });

        }
        catch (error) {

            console.log(error);

        }

    };


    loadRecipes();


    recipeSearch.addEventListener("input", () => {

        let searchValue =
            recipeSearch.value.toLowerCase();


        let cards =
            document.querySelectorAll(".recipeCard");


        cards.forEach((card) => {

            let title =
                card.querySelector("h5")
                    .innerText
                    .toLowerCase();


            if (title.includes(searchValue)) {

                card.style.display = "block";

            }
            else {

                card.style.display = "none";

            }

        });

    });


    recipeCategory.addEventListener("change", () => {

        let selectedCategory =
            recipeCategory.value;


        let cards =
            document.querySelectorAll(".recipeCard");


        cards.forEach((card) => {

            let category =
                card.getAttribute("data-category");


            if (
                selectedCategory === "" ||
                category === selectedCategory
            ) {

                card.style.display = "block";

            }
            else {

                card.style.display = "none";

            }

        });

    });

}


// recipe details

if (document.querySelector("#recipeDetails")) {

    const loadRecipeDetails = async () => {

        let url =
            new URLSearchParams(window.location.search);


        let id =
            url.get("id");


        if (!id) {

            return;

        }


        const { data, error } =
            await client
                .from("recipes")
                .select("*")
                .eq("id", id)
                .single();


        console.log("Recipe Details:", data);

        console.log("Recipe Details Error:", error);


        if (error) {

            console.log(error);

            return;

        }


        let authorName = "Recipe User";


        const { data: authorData } =
            await client
                .from("recipe_data")
                .select("name")
                .eq("user_id", data.user_id)
                .single();


        if (authorData) {

            authorName = authorData.name;

        }


        let container =
            document.querySelector("#recipeDetails");


        container.innerHTML = `

            <div class="card">

                <img
                    src="${data.image_url}"
                    class="card-img-top"
                    style="max-height:450px; object-fit:cover;"
                >

                <div class="card-body p-4">

                    <h1>
                        ${data.title}
                    </h1>

                    <p>
                        ${data.description}
                    </p>

                    <p>
                        <strong>Category:</strong>
                        ${data.category}
                    </p>

                    <p>
                        <strong>Cooking Time:</strong>
                        ${data.cooking_time}
                    </p>

                    <p>
                        <strong>Author:</strong>
                        ${authorName}
                    </p>

                    <p>
                        <strong>Date:</strong>
                        ${new Date(
                            data.created_at
                        ).toLocaleDateString()}
                    </p>

                    <h4>
                        Ingredients
                    </h4>

                    <p>
                        ${data.ingredients}
                    </p>

                    <h4>
                        Instructions
                    </h4>

                    <p>
                        ${data.instructions}
                    </p>

                </div>

            </div>

        `;

    };


    loadRecipeDetails();

}