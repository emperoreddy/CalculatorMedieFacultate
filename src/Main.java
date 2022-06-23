import java.util.ArrayList;
import java.util.Scanner;

public class Main {

    public static void main(String[] args) {
        ArrayList<Integer> matrice1 = new ArrayList<>();
        ArrayList<Integer> matrice2 = new ArrayList<>();
        int i = 0;
        int sum = 0;
        Scanner input = new Scanner(System.in);

        System.out.println("PUNE O LITERA CAND TERMINI DE CITIT DATELE");

        while (true) {
            System.out.println("---------");
            System.out.println("Materia " + (i + 1));
            System.out.println("---------");

            System.out.print("Nota: ");
            int rezMat1 = input.nextInt();
            if (rezMat1 == 0)
                break;

            matrice1.add(rezMat1);

            System.out.print("Credite: ");
            int rezMat2 = input.nextInt();
            matrice2.add(rezMat2);
            System.out.println();

            sum += matrice2.get(i);
            i++;
        }

        double multiply = 0;
        for (i = 0; i < matrice1.size(); i++) {
            multiply += (matrice1.get(i) * matrice2.get(i));
        }

        double total = multiply / sum;
        System.out.println("| ---------------- |");
        System.out.printf("| MEDIA ESTE: %.2f |\n", total);
        System.out.println("| ---------------- |");
        
        input.close();
       
    }

}
