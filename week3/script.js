    let clrArea =document.getElementById("colorArea")
        console.log(clrArea)
    let imgmodel = document.getElementById("imgmodel")
    let clrBtn = document.getElementById("colorButton")
    let txtBtn = document.getElementById("textButton")
    let imgBtn = document.getElementById("imageButton")

        let cahngingClor =  ()=>{
            let redC= Math.random()*255
            let greenC=Math.random()*255
            let blueC=Math.random()*255

           clrArea.style.backgroundColor="rgb("+ redC +","+ greenC+","+ blueC+")"
        }

        let addingText = ()=>{
            let p = document.createElement("p")
            console.log(p)
            p.innerHTML = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque fringilla elit a ipsum porttitor feugiat. Ut porta diam sit amet convallis vulputate. Vestibulum non tincidunt nulla, in feugiat velit. Nullam interdum tincidunt placerat."
        
            clrArea.after(p)
        }
        let changingImage = ()=>{
            
            if (imgmodel.alt == "model 1"){
                imgmodel.src= "images/kawaii.png"
                imgmodel.alt= "kawaii"

            }
            else {imgmodel.src= "images/carrier.png"
                  imgmodel.alt= "model 1"

            }
        }

        clrBtn.addEventListener("click",cahngingClor)
        txtBtn.addEventListener("click", addingText)
        imgBtn.addEventListener("click", changingImage)