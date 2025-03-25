import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Investment, 
  insertInvestmentSchema, 
  investmentClasses,
  investmentSubclasses 
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";

interface InvestmentFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  investment: Investment | null;
  isLoading: boolean;
}

// Create a form schema with our validation rules
const formSchema = z.object({
  clientId: z.number(),
  name: z.string().min(1, {
    message: "Nome do ativo é obrigatório",
  }),
  class: z.string().min(1, {
    message: "Classe é obrigatória",
  }),
  subclass: z.string().min(1, {
    message: "Subclasse é obrigatória",
  }),
  quantity: z.coerce.number().positive({
    message: "Quantidade deve ser um número positivo",
  }),
  unitPrice: z.coerce.number().positive({
    message: "Preço unitário deve ser um número positivo",
  }),
  autoUpdatePrice: z.boolean().optional().default(false),
  ticker: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  data => {
    // Validate class and subclass combination
    const validSubclasses = investmentSubclasses[data.class as keyof typeof investmentSubclasses];
    return validSubclasses?.includes(data.subclass as any);
  },
  {
    message: "Subclasse inválida para a classe de investimento selecionada",
    path: ["subclass"],
  }
);

export default function InvestmentForm({
  onSubmit,
  onCancel,
  investment,
  isLoading,
}: InvestmentFormProps) {
  const [selectedClass, setSelectedClass] = useState<string>(
    investment?.class || investmentClasses[0]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: investment
      ? {
          clientId: investment.clientId,
          name: investment.name,
          class: investment.class,
          subclass: investment.subclass,
          quantity: investment.quantity,
          unitPrice: investment.unitPrice,
          autoUpdatePrice: investment.autoUpdatePrice,
          ticker: investment.ticker || "",
          notes: investment.notes || "",
        }
      : {
          clientId: 0, // This will be set when the form is submitted
          name: "",
          class: investmentClasses[0],
          subclass: "",
          quantity: 1,
          unitPrice: 0,
          autoUpdatePrice: false,
          ticker: "",
          notes: "",
        },
  });

  // Update subclass options when class changes
  useEffect(() => {
    const currentClass = form.watch("class");
    if (currentClass !== selectedClass) {
      setSelectedClass(currentClass);
      // Reset subclass when class changes
      form.setValue("subclass", "");
    }
  }, [form.watch("class"), selectedClass, form]);

  // Get available subclasses for the selected class
  const getSubclasses = () => {
    const classValue = selectedClass as keyof typeof investmentSubclasses;
    return investmentSubclasses[classValue] || [];
  };

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{investment ? "Editar Investimento" : "Adicionar Investimento"}</DialogTitle>
          <DialogDescription>
            {investment
              ? "Atualize as informações do investimento abaixo."
              : "Preencha as informações do novo investimento."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Ativo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do ativo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedClass(value);
                        // Reset subclass when class changes
                        form.setValue("subclass", "");
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma classe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {investmentClasses.map((investmentClass) => (
                          <SelectItem key={investmentClass} value={investmentClass}>
                            {investmentClass}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subclass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subclasse</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma subclasse" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getSubclasses().map((subclass) => (
                          <SelectItem key={subclass} value={subclass}>
                            {subclass}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Unitário (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="autoUpdatePrice"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Buscar preço automaticamente (se disponível)
                    </FormLabel>
                    <FormDescription>
                      Quando disponível, o sistema atualizará o preço automaticamente.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("autoUpdatePrice") && (
              <FormField
                control={form.control}
                name="ticker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticker</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="PETR4"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Código do ativo na bolsa para atualização automática (ex: PETR4, VALE3)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais sobre o investimento"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional. Adicione notas importantes sobre este investimento.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : investment ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
