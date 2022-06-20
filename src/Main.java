import java.util.Scanner;

public class Main {

    public static void main(String[] args) {
        int[][] matrice1 = new int[10][1];
        int[][] matrice2 = new int[10][1];
        int sum = 0;
        Scanner input = new Scanner(System.in);

        System.out.println("PUNE 0 CAND TERMINI DE CITIT DATELE");
        for (int i = 0; i < 15; i++) {
            System.out.println("Materia " + (i + 1));
            for (int j = 0; j < 1; j++) {
                System.out.println("Nota: ");
                matrice1[i][j] = input.nextInt();
                System.out.println("Credite: ");
                matrice2[i][j] = input.nextInt();
                sum = matrice1[i][j] + matrice2[i][j];
                if (matrice1[i][j] == 0 || matrice2[i][j] == 0)
                    return;
            }
        }
        int multiply = 1;
        for (int i = 0; i < matrice2.length; i++)
            for (int j = 0; j < matrice2.length; j++) {
            multiply = matrice1[i][j] * matrice2[i][j];
            }

        int total = multiply / sum;
        System.out.println("MEDIA ESTE: " + total);
    }


}

