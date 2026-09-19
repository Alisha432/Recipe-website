const supabaseUrl = "https://edaxqmayxajztfcsouqg.supabase.co";
const supabaseKey = "sb_publishable_86yyo8GVbSp02Yjxs4CfVQ_HvzKINpH";

const { createClient } = supabase;

const client = createClient(supabaseUrl, supabaseKey);

console.log(client);


// signup

let signupForm = document.querySelector("#formData");
let signup = document.querySelector("#signupBtn");

signup && signup.addEventListener("click", (event) => {

    event.preventDefault();

    window.location.href = "./signup.html";

});


signupForm && signupForm.addEventListener("submit", async (event) => {

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
            return;
        }


        const allData = Object.fromEntries(data);

        const { email, password, name } = allData;


        const { data: signupdata, error } =
            await client.auth.signUp({
                email,
                password
            });


        console.log(signupdata);
        console.log(error);


        if (error) {

            console.log(error.message);

            return;

        }


        let id = signupdata.user.id;

        console.log(id);


        const { error: signuperror } =
            await client
                .from("recipe_data")
                .insert({
                    name: name,
                    user_id: id
                });


        console.log(signuperror);


        if (signuperror) {

            console.log(signuperror.message);

            return;

        }


        console.log("Signup successful");

    }
    catch (error) {

        console.log(error);

    }

});


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


loginSignupBtn && loginSignupBtn.addEventListener("click", (event) => {

    event.preventDefault();

    window.location.href = "./signup.html";

});


loginForm && loginForm.addEventListener("submit", async (event) => {

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

            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: signinerror.message
            });

            return;

        }


        console.log("Session:", signindata.session);


        Swal.fire({
            icon: "success",
            title: "Login Successful",
            text: "Welcome back!"
        }).then(() => {

            window.location.href = "./dashboard.html";

        });

    }
    catch (error) {

        console.log(error);

    }

});


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


            if (error) {

                console.log(error);

                return;

            }


            if (!data.session) {

                console.log("User is not logged in");

                return;

            }


            let userId = data.session.user.id;


            console.log("User ID:", userId);


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
                .select("id, title, description, category, cooking_time");


        console.log("Recent Recipes:", data);

        console.log("Recent Error:", error);


        if (error) {

            console.log(error);

            return;

        }


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
                                Cooking Time: ${recipe.cooking_time}
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

    let titleBox = document.querySelector("#recipeTitle");
    let descriptionBox = document.querySelector("#recipeDescription");
    let categoryBox = document.querySelector("#recipeCategory");
    let ingredientsBox = document.querySelector("#recipeIngredients");
    let instructionsBox = document.querySelector("#recipeInstructions");
    let timeBox = document.querySelector("#recipeTime");
    let pictureBox = document.querySelector("#recipePic");


    recipeForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        try {

            const { data, error } =
                await client.auth.getSession();


            if (error) {

                console.log(error);

                return;

            }


            if (!data.session) {

                alert("Please Login First");

                window.location.href = "./login.html";

                return;

            }


            let userId = data.session.user.id;

            let imageUrl = "";


            if (pictureBox.files.length > 0) {

                let image = pictureBox.files[0];


                const { data: upload, error: uploadError } =
                    await client.storage
                        .from("recipe_images")
                        .upload(image.name, image);


                console.log(upload);


                if (uploadError) {

                    console.log(uploadError);

                    return;

                }


                const { data: url } =
                    client.storage
                        .from("recipe_images")
                        .getPublicUrl(image.name);


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

let savedList = document.querySelector("#savedRecipeList");

if (savedList) {

    const showMyRecipes = async () => {

        try {

            const { data, error } =
                await client.auth.getSession();


            console.log("Session:", data);

            console.log("Session Error:", error);


            if (error) {

                console.log(error);

                return;

            }


            if (!data.session) {

                console.log("User is not logged in");

                alert("Please Login First");

                window.location.href = "./login.html";

                return;

            }


            let userId = data.session.user.id;


            console.log("User ID:", userId);


            const { data: recipes, error: recipeError } =
                await client
                    .from("recipes")
                    .select("id, title, description, category, ingredients, instructions, cooking_time, image_url")
                    .eq("user_id", userId);


            console.log("My Recipes:", recipes);

            console.log("Recipe Error:", recipeError);


            if (recipeError) {

                console.log(recipeError);

                return;

            }


            if (recipes.length === 0) {

                savedList.innerHTML = `
                    <div class="col-12">
                        <h4>No Recipes Found</h4>
                        <p>You have not added any recipes yet.</p>
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

                                <p>${recipe.description}</p>

                                <p>
                                    Category: ${recipe.category}
                                </p>

                                <p>
                                    Cooking Time: ${recipe.cooking_time}
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


            // delete

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


                            const { error: imageError } =
                                await client.storage
                                    .from("recipe_images")
                                    .remove([imagePath]);


                            if (imageError) {

                                console.log(imageError);

                                return;

                            }

                        }


                        const { error } =
                            await client
                                .from("recipes")
                                .delete()
                                .eq("id", recipeId);


                        if (error) {

                            console.log(error);

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


            // edit

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


                    try {

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

                            return;

                        }


                        alert("Recipe Updated Successfully");

                        location.reload();

                    }
                    catch (error) {

                        console.log(error);

                    }

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

let logout = document.querySelector("#logout");

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

let dishBtn = document.querySelector("#dish");

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


    const loadCategories = async () => {

        const { data, error } =
            await client
                .from("recipe_categories")
                .select("id, name");


        if (error) {

            console.log(error);

            return;

        }


        data.forEach((category) => {

            recipeCategory.innerHTML += `

                <option value="${category.name}">
                    ${category.name}
                </option>

            `;

        });

    };


    const loadRecipes = async () => {

        try {

            const { data, error } =
                await client
                    .from("recipes")
                    .select("id, title, description, category, ingredients, cooking_time, image_url");


            if (error) {

                console.log(error);

                return;

            }


            recipesList.innerHTML = "";


            data.forEach(async (recipe) => {

                let ingredientsText =
                    recipe.ingredients;


                const { data: links, error: linkError } =
                    await client
                        .from("recipe_ingredient_links")
                        .select("ingredient_id")
                        .eq("recipe_id", recipe.id);


                if (linkError) {

                    console.log(linkError);

                }


                if (links && links.length > 0) {

                    ingredientsText = "";


                    links.forEach(async (link) => {

                        const { data: ingredient, error: ingredientError } =
                            await client
                                .from("recipe_ingredients_data")
                                .select("name")
                                .eq("id", link.ingredient_id);


                        if (ingredientError) {

                            console.log(ingredientError);

                            return;

                        }


                        if (ingredient.length > 0) {

                            ingredientsText +=
                                ingredient[0].name + ", ";

                        }

                    });

                }


                const { data: favorites, error: favoriteError } =
                    await client
                        .from("favorite_recipes")
                        .select("id")
                        .eq("recipe_id", recipe.id);


                if (favoriteError) {

                    console.log(favoriteError);

                }


                let favoriteText = "Favorite";


                if (favorites && favorites.length > 0) {

                    favoriteText = "Favorited";

                }


                recipesList.innerHTML += `

                    <div class="col-12 col-md-6 col-lg-4 recipeCard">

                        <div class="card h-100">

                            <img
                                src="${recipe.image_url}"
                                class="card-img-top"
                            >

                            <div class="card-body">

                                <h5>${recipe.title}</h5>

                                <p>${recipe.description}</p>

                                <p>
                                    Category: ${recipe.category}
                                </p>

                                <p>
                                    Cooking Time: ${recipe.cooking_time}
                                </p>

                                <p>
                                    Ingredients: ${ingredientsText}
                                </p>

                                <button
                                    class="btn btn-dark detailsBtn"
                                    data-id="${recipe.id}">
                                    View Details
                                </button>

                                <button
                                    class="btn btn-outline-dark favoriteBtn"
                                    data-id="${recipe.id}">
                                    ${favoriteText}
                                </button>

                            </div>

                        </div>

                    </div>

                `;

            });

        }
        catch (error) {

            console.log(error);

        }

    };


    loadCategories();

    loadRecipes();


    recipeSearch.addEventListener("input", () => {

        let searchValue =
            recipeSearch.value.toLowerCase();


        let cards =
            document.querySelectorAll(".recipeCard");


        cards.forEach((card) => {

            let title =
                card.querySelector("h5").innerText.toLowerCase();


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
                card.querySelector(".card-body p").innerText;


            if (
                selectedCategory == "" ||
                category.includes(selectedCategory)
            ) {

                card.style.display = "block";

            }
            else {

                card.style.display = "none";

            }

        });

    });

}